package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.*
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.*
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.CompetitionZippingData
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.ScrambleZip
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.ZipArchive
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.ZipArchive.Companion.withUniqueTitles
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

object WCIFDataBuilder {
    private val PDF_CACHE = mutableMapOf<ScrambleDrawingData, PdfContent>()

    const val WATERMARK_STAGING = "STAGING"
    const val WATERMARK_OUTDATED = "OUTDATED"
    const val WATERMARK_UNOFFICIAL = "UNOFFICIAL"

    fun Competition.toScrambleSetData(): CompetitionDrawingData {
        val frontendStatus = findExtension<TNoodleStatusExtension>()
        val frontendWatermark = frontendStatus?.pickWatermarkPhrase()

        val sheets = events.flatMap { e ->
            e.rounds.flatMap { r ->
                val copyCountExtension = r.findExtension<SheetCopyCountExtension>()

                r.scrambleSets.withIndex()
                    .flatMap { splitAttemptBasedEvents(e, r, it.index, it.value) }
                    .map {
                        val extendedScrSet = it.scrambleSet.copy(extensions = it.scrambleSet.withExtension(copyCountExtension))
                        it.copy(scrambleSet = extendedScrSet, watermark = frontendWatermark, hasGroupID = r.scrambleSetCount > 1)
                    }
            }
        }

        return CompetitionDrawingData(shortName, sheets)
    }

    private fun splitAttemptBasedEvents(event: Event, round: Round, group: Int, set: ScrambleSet): List<ScrambleDrawingData> {
        val baseCode = round.idCode.copyParts(groupNumber = group)

        // 333mbf is handled pretty specially: each "scramble" is actually a newline separated
        // list of 333ni scrambles.
        // If we detect that we're dealing with 333mbf, then we will generate 1 sheet per attempt,
        // rather than 1 sheet per round (as we do with every other event).
        if (event.eventModel in EventData.ATTEMPT_BASED_EVENTS) {
            return set.scrambles.mapIndexed { nthAttempt, scrambleStr ->
                val scrambles = scrambleStr.allScrambleStrings.map { Scramble(it) }
                val attemptExtensions = computeAttemptExtensions(event, round, scrambles)

                val pseudoCode = baseCode.copyParts(attemptNumber = nthAttempt)

                val attemptScrambles = set.copy(
                    scrambles = scrambles,
                    extraScrambles = listOf(),
                    extensions = set.withExtensions(attemptExtensions)
                )

                defaultScrambleDrawingData(attemptScrambles, pseudoCode)
            }
        }

        val defaultExtensions = computeAttemptExtensions(event, round, set.scrambles)
        val extendedSet = set.copy(extensions = set.withExtensions(defaultExtensions))

        return listOf(defaultScrambleDrawingData(extendedSet, baseCode))
    }

    private fun defaultScrambleDrawingData(set: ScrambleSet, ac: ActivityCode): ScrambleDrawingData {
        return ScrambleDrawingData(set, ac)
    }

    private fun computeAttemptExtensions(event: Event, round: Round, scrambles: List<Scramble>): List<ExtensionBuilder> {
        return when (event.eventModel) {
            EventData.THREE_FM -> {
                val formatExtension = FmcAttemptCountExtension(round.expectedAttemptNum)
                val languageExtension = round.findExtension<FmcLanguagesExtension>()

                listOfNotNull(formatExtension, languageExtension)
            }
            EventData.THREE_MULTI_BLD -> listOf(FmcExtension(false), MultiScrambleCountExtension(scrambles.size))
            else -> listOf()
        }
    }

    fun TNoodleStatusExtension.pickWatermarkPhrase(): String? {
        return if (!isOfficialBuild) {
            WATERMARK_UNOFFICIAL
        } else if (!isRecentVersion) {
            WATERMARK_OUTDATED
        } else if (isStaging) {
            WATERMARK_STAGING
        } else null
    }

    fun wcifToZip(wcif: Competition, pdfPassword: String?, generationDate: LocalDateTime, versionTag: String, generationUrl: String): ZipArchive {
        val drawingData = wcif.toScrambleSetData()

        val namedSheets = drawingData.scrambleSheets
            .withUniqueTitles { it.activityCode.compileTitleString(includeGroupID = it.hasGroupID) }

        val zippingData = CompetitionZippingData(wcif, namedSheets)
        return requestsToZip(zippingData, pdfPassword, generationDate, versionTag, generationUrl)
    }

    fun requestsToZip(zipRequest: CompetitionZippingData, pdfPassword: String?, generationDate: LocalDateTime, versionTag: String, generationUrl: String): ZipArchive {
        val scrambleZip = ScrambleZip(zipRequest.namedSheets, zipRequest.wcif)
        return scrambleZip.assemble(generationDate, versionTag, pdfPassword, generationUrl)
    }

    fun wcifToCompletePdf(wcif: Competition, generationDate: LocalDate, versionTag: String): PdfContent {
        val drawingData = wcif.toScrambleSetData()
        return requestsToCompletePdf(drawingData, generationDate, versionTag)
    }

    fun requestsToCompletePdf(sheetRequest: CompetitionDrawingData, generationDate: LocalDate, versionTag: String): PdfContent {
        val scrambleRequests = sheetRequest.scrambleSheets

        val originalPdfs = scrambleRequests.map {
            it.getCachedPdf(generationDate, versionTag, sheetRequest.competitionTitle, Translate.DEFAULT_LOCALE)
        }

        val configurations = scrambleRequests.map {
            Triple(it.activityCode.compileTitleString(false, includeGroupID = it.hasGroupID), it.activityCode.eventModel?.description.orEmpty(), it.numCopies)
        }

        return MergedPdfWithOutline(originalPdfs, configurations)
    }

    // register in cache to speed up overall generation process
    fun ScrambleDrawingData.getCachedPdf(creationDate: LocalDate, versionTag: String, sheetTitle: String, locale: Locale) =
        PDF_CACHE.getOrPut(this) { createPdf(creationDate, versionTag, sheetTitle, locale) }
}
