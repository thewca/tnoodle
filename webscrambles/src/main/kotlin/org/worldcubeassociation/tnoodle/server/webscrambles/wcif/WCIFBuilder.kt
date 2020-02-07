package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.*
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.ScrambleZip
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.ZipArchive
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

object WCIFBuilder {
    private val PDF_CACHE = mutableMapOf<ScrambleDrawingData, PdfContent>()

    fun List<Event>.toScrambleSetData(): List<ScrambleDrawingData> {
        return flatMap { e ->
            e.rounds.flatMap { r ->
                r.scrambleSets.mapIndexed { scrNum, it -> ScrambleDrawingData(it, r.idCode.copyParts(groupNumber = scrNum)) }
            }
        }
    }

    fun wcifToZip(wcif: Competition, pdfPassword: String?, generationDate: LocalDateTime, versionTag: String, generationUrl: String): ZipArchive {
        val scrambleZip = ScrambleZip(wcif)
        return scrambleZip.assemble(generationDate, versionTag, pdfPassword, generationUrl)
    }

    fun wcifToCompletePdf(wcif: Competition, generationDate: LocalDate, versionTag: String): PdfContent {
        val drawingData = wcif.events.toScrambleSetData()
        return requestsToCompletePdf(drawingData, generationDate, versionTag)
    }

    fun requestsToCompletePdf(scrambleRequests: List<ScrambleDrawingData>, generationDate: LocalDate, versionTag: String): PdfContent {
        val originalPdfs = scrambleRequests.map {
            it.getCachedPdf(generationDate, versionTag, Translate.DEFAULT_LOCALE)
        }

        val configurations = scrambleRequests.map { Triple("someExcitingTitle", it.scramblingPuzzle.longName, 1) } // FIXME WCIF copies, title

        // FIXME WCIF
        return MergedPdfWithOutline(originalPdfs, configurations, "globalTitle")
    }

    fun ScrambleDrawingData.createPdf(creationDate: LocalDate, versionTag: String, locale: Locale): PdfContent {
        // 333mbf is handled pretty specially: each "scramble" is actually a newline separated
        // list of 333ni scrambles.
        // If we detect that we're dealing with 333mbf, then we will generate 1 sheet per attempt,
        // rather than 1 sheet per round (as we do with every other event).

        // for ordered scrambles, we recreate scrambleRequest so it contains only 1 scramble
        // to fix this, we pass the attempt number
        if (activityCode.eventId == "333mbf") {
            val singleSheets = scrambleSet.scrambles.mapIndexed { nthAttempt, scrambleStr ->
                val scrambles = scrambleStr.allScrambleStrings.map { Scramble(it) }
                // FIXME WCIF val titleAttemptNum = if (attempt > 1) attempt else (nthAttempt + 1)

                val pseudoCode = ActivityCode.compile("333bf", activityCode.roundNumber, activityCode.groupNumber, activityCode.attemptNumber)

                val attemptScrambles = scrambleSet.copy(
                    scrambles = scrambles,
                    extraScrambles = listOf(),
                    extensions = scrambleSet.extensions + FmcExtension(false)
                )

                val attemptRequest = ScrambleDrawingData(attemptScrambles, pseudoCode)
                attemptRequest.createPdf(creationDate, versionTag, locale)
            }

            return MergedPdf(singleSheets)
        }

        assert(scrambleSet.scrambles.isNotEmpty())
        val isFmc = scrambleSet.extensions.findExtension<FmcExtension>()?.data ?: false

        if (isFmc) {
            // We don't watermark the FMC sheets because they already have
            // the competition name on them. So we encrypt directly.
            return FmcSolutionSheet(scrambleSet, activityCode, locale)
        }

        val genericSheet = GeneralScrambleSheet(scrambleSet, activityCode) // encrypt when watermarking
        return WatermarkPdfWrapper(genericSheet, "scrReq Title", creationDate, versionTag, "globalTitle") // FIXME WCIF
    }

    // register in cache to speed up overall generation process
    fun ScrambleDrawingData.getCachedPdf(creationDate: LocalDate, versionTag: String, locale: Locale) =
        PDF_CACHE.getOrPut(this) { createPdf(creationDate, versionTag, locale) }
}
