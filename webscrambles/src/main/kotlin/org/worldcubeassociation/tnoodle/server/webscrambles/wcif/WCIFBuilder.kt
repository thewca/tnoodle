package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.*
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFRequestBinding.Companion.generateBindings
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.ScrambleZip
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.ZipArchive
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.*

object WCIFBuilder {
    private val PDF_CACHE = mutableMapOf<ScrambleRequest, PdfContent>()

    fun requestsToZip(wcif: Competition, pdfPassword: String, generationDate: LocalDateTime, versionTag: String, generationUrl: String): ZipArchive {
        val bindings = wcif.generateBindings("todo")
        val scrambleRequests = bindings.activityScrambleRequests.values.flatten()

        val scrambleZip = ScrambleZip(scrambleRequests, bindings)
        return scrambleZip.assemble(generationDate, versionTag, pdfPassword, generationUrl)
    }

    fun requestsToCompletePdf(wcif: Competition, generationDate: LocalDate, versionTag: String): PdfContent {
        val bindings = wcif.generateBindings("todo")
        val scrambleRequests = bindings.activityScrambleRequests.values.flatten()

        val globalTitle = wcif.shortName

        val originalPdfs = scrambleRequests.map {
            it.getCachedPdf(globalTitle, generationDate, versionTag, Translate.DEFAULT_LOCALE)
        }

        val configurations = scrambleRequests.map { Triple(it.title, it.scrambler.longName, it.copies) }

        return MergedPdfWithOutline(originalPdfs, configurations, globalTitle)
    }

    fun ScrambleRequest.createPdf(globalTitle: String?, creationDate: LocalDate, versionTag: String, locale: Locale): PdfContent {
        // 333mbf is handled pretty specially: each "scramble" is actually a newline separated
        // list of 333ni scrambles.
        // If we detect that we're dealing with 333mbf, then we will generate 1 sheet per attempt,
        // rather than 1 sheet per round (as we do with every other event).

        // for ordered scrambles, we recreate scrambleRequest so it contains only 1 scramble
        // to fix this, we pass the attempt number
        if (event == "333mbf") {
            val singleSheets = scrambles.mapIndexed { nthAttempt, scrambleStr ->
                val scrambles = scrambleStr.split("\n")
                val titleAttemptNum = if (attempt > 1) attempt else (nthAttempt + 1)

                val attemptRequest = copy(
                    scrambles = scrambles,
                    extraScrambles = listOf(),
                    title = "$title Attempt $titleAttemptNum",
                    fmc = false,
                    event = "333bf"
                )

                attemptRequest.createPdf(globalTitle, creationDate, versionTag, locale)
            }

            return MergedPdf(singleSheets)
        }

        assert(scrambles.isNotEmpty())

        if (fmc) {
            // We don't watermark the FMC sheets because they already have
            // the competition name on them. So we encrypt directly.
            return FmcSolutionSheet(this, globalTitle, locale)
        }

        val genericSheet = GeneralScrambleSheet(this, globalTitle) // encrypt when watermarking
        return WatermarkPdfWrapper(genericSheet, title, creationDate, versionTag, globalTitle)
    }

    // register in cache to speed up overall generation process
    fun ScrambleRequest.getCachedPdf(globalTitle: String?, creationDate: LocalDate, versionTag: String, locale: Locale) =
        PDF_CACHE.getOrPut(this) { createPdf(globalTitle, creationDate, versionTag, locale) }
}
