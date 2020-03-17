package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import org.worldcubeassociation.tnoodle.server.plugins.EventPlugins
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

    fun Competition.toScrambleSetData(): CompetitionDrawingData {
        val sheets = events.flatMap { e ->
            e.rounds.flatMap { r ->
                r.scrambleSets.mapIndexed { scrNum, it ->
                    val copyCode = r.idCode.copyParts(groupNumber = scrNum)

                    val specificExtensions = if (e.plugin == EventPlugins.THREE_FM) {
                        val formatExtension = FmcAttemptCountExtension(r.expectedAttemptNum)
                        val languageExtension = r.findExtension<FmcLanguagesExtension>()

                        listOfNotNull(formatExtension, languageExtension)
                    } else {
                        listOf()
                    }

                    val generalExtensions = specificExtensions + r.findExtension<SheetCopyCountExtension>()
                    val extendedScrSet = it.copy(extensions = it.withExtensions(generalExtensions))

                    ScrambleDrawingData(extendedScrSet, copyCode, hasExtension<StagingFlagExtension>())
                }
            }
        }

        return CompetitionDrawingData(shortName, sheets)
    }

    fun wcifToZip(wcif: Competition, pdfPassword: String?, generationDate: LocalDateTime, versionTag: String, generationUrl: String): ZipArchive {
        val drawingData = wcif.toScrambleSetData()

        val namedSheets = drawingData.scrambleSheets
            .withUniqueTitles { it.activityCode.compileTitleString() }

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
            Triple(it.activityCode.compileTitleString(false), Event.getEventName(it.activityCode.eventId).orEmpty(), it.numCopies)
        }

        return MergedPdfWithOutline(originalPdfs, configurations)
    }

    fun ScrambleDrawingData.createPdf(creationDate: LocalDate, versionTag: String, sheetTitle: String, locale: Locale): PdfContent {
        // 333mbf is handled pretty specially: each "scramble" is actually a newline separated
        // list of 333ni scrambles.
        // If we detect that we're dealing with 333mbf, then we will generate 1 sheet per attempt,
        // rather than 1 sheet per round (as we do with every other event).

        // for ordered scrambles, we recreate scrambleRequest so it contains only 1 scramble
        // to fix this, we pass the attempt number
        if (activityCode.eventPlugin == EventPlugins.THREE_MULTI_BLD && !scrambleSet.hasExtension<MultiScrambleCountExtension>()) {
            val singleSheets = scrambleSet.scrambles.mapIndexed { nthAttempt, scrambleStr ->
                val scrambles = scrambleStr.allScrambleStrings.map { Scramble(it) }

                // +1 for human readability so the first attempt (index 0) gets printed as "Attempt 1"
                val pseudoCode = activityCode.copyParts(attemptNumber = nthAttempt + 1)

                val attemptScrambles = scrambleSet.copy(
                    scrambles = scrambles,
                    extraScrambles = listOf(),
                    extensions = scrambleSet.withExtensions(FmcExtension(false), MultiScrambleCountExtension(scrambles.size))
                )

                val attemptRequest = copy(scrambleSet = attemptScrambles, activityCode = pseudoCode)
                attemptRequest.createPdf(creationDate, versionTag, sheetTitle, locale)
            }

            return MergedPdf(singleSheets)
        }

        assert(scrambleSet.scrambles.isNotEmpty())

        if (isFmc) {
            // We don't watermark the FMC sheets because they already have
            // the competition name on them. So we encrypt directly.
            return FmcSolutionSheet(scrambleSet, activityCode, sheetTitle, locale)
        }

        val genericSheet = GeneralScrambleSheet(scrambleSet, activityCode) // encrypt when watermarking
        return WatermarkPdfWrapper(genericSheet, activityCode.compileTitleString(), creationDate, versionTag, sheetTitle, isStaging)
    }

    // register in cache to speed up overall generation process
    fun ScrambleDrawingData.getCachedPdf(creationDate: LocalDate, versionTag: String, sheetTitle: String, locale: Locale) =
        PDF_CACHE.getOrPut(this) { createPdf(creationDate, versionTag, sheetTitle, locale) }
}
