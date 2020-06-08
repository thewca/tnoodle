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
        val sheets = events.flatMap { e ->
            e.rounds.flatMap { r ->
                r.scrambleSets.mapIndexed { scrNum, it ->
                    val copyCode = r.idCode.copyParts(groupNumber = scrNum)

                    val specificExtensions = if (e.eventModel == EventData.THREE_FM) {
                        val formatExtension = FmcAttemptCountExtension(r.expectedAttemptNum)
                        val languageExtension = r.findExtension<FmcLanguagesExtension>()

                        listOfNotNull(formatExtension, languageExtension)
                    } else {
                        listOf()
                    }

                    val generalExtensions = specificExtensions + r.findExtension<SheetCopyCountExtension>()
                    val extendedScrSet = it.copy(extensions = it.withExtensions(generalExtensions))

                    val frontendStatus = findExtension<TNoodleStatusExtension>()
                    val frontendWatermark = frontendStatus?.pickWatermarkPhrase()

                    ScrambleDrawingData(extendedScrSet, copyCode, frontendWatermark)
                }
            }
        }

        return CompetitionDrawingData(shortName, sheets)
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
