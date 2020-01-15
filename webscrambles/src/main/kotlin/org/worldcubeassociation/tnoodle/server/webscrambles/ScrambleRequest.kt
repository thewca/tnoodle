package org.worldcubeassociation.tnoodle.server.webscrambles

import net.gnehzr.tnoodle.puzzle.ThreeByThreeCubePuzzle
import net.gnehzr.tnoodle.scrambles.Puzzle
import net.gnehzr.tnoodle.scrambles.ScrambleCacher
import net.lingala.zip4j.io.outputstream.ZipOutputStream
import net.lingala.zip4j.model.ZipParameters
import net.lingala.zip4j.model.enums.CompressionLevel
import net.lingala.zip4j.model.enums.CompressionMethod
import net.lingala.zip4j.model.enums.EncryptionMethod
import org.worldcubeassociation.tnoodle.server.util.GsonUtil.GSON
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.*
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.StringUtil.randomPasscode
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.StringUtil.stripNewlines
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.StringUtil.toFileSafeString
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.OrderedScrambles
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.WCIF
import java.io.ByteArrayOutputStream
import java.net.URLDecoder
import java.time.LocalDate
import java.util.*
import kotlin.math.min
import net.gnehzr.tnoodle.svglite.Color

data class ScrambleRequest(
    val scrambles: List<String>,
    val extraScrambles: List<String>,
    val scrambler: Puzzle,
    val copies: Int,
    val title: String,
    val fmc: Boolean,
    val colorScheme: HashMap<String, Color>?,

    // totalAttempt and attempt are useful for when we have multiple attempts split in the schedule.
    // Usually, tnoodle prints scrambles for a ScrambleRequest iterating over ScrambleRequest.scrambles.
    // So, if ScrambleRequest.scrambles.length == 3, tnoodle prints Scramble 1 of 3, Scramble 2 of 3 and Scramble 3 of 3.
    // But for OrderedScrambles, these scrambles are split on the schedule, so we replace Scramble.scrambles = {Scramble.scrambles[attempt]}.
    // To continue printing Scramble x of y, we use attempt as x and totalAttempt as y.
    val totalAttempt: Int,
    val attempt: Int,

    // The following attributes are here purely so the scrambler ui
    // can pass these straight to the generated JSON we put in the
    // zip file. This makes it easier to align that JSON with the rounds
    // of a competition.
    val group: String?, // This legacy field is still used by the WCA Workbook Assistant. When we get rid of the WA, we can get rid of this.
    val scrambleSetId: String?,
    val event: String,
    val round: Int
) {
    val allScrambles get() = scrambles + extraScrambles

    fun createPdf(globalTitle: String?, creationDate: LocalDate, versionTag: String, locale: Locale): PdfContent {
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

    companion object {
        private val HTML_SCRAMBLE_VIEWER = "/wca/scrambleviewer.html"

        private val MAX_COUNT = 100
        private val MAX_COPIES = 100

        private val SCRAMBLE_CACHERS = mutableMapOf<String, ScrambleCacher>()

        fun empty(scrambler: Puzzle) =
            ScrambleRequest(
                listOf(),
                listOf(),
                scrambler,
                0,
                "",
                false,
                null,
                0,
                0,
                null,
                null,
                "",
                0
            )

        fun parseScrambleRequest(title: String, reqUrl: String, seed: String?): ScrambleRequest {
            // Note that we prefix the seed with the title of the round! This ensures that we get unique
            // scrambles in different rounds. Thanks to Ravi Fernando for noticing this at Stanford Fall 2011.
            // (http://www.worldcubeassociation.org/results/c.php?i=StanfordFall2011).
            val uniqueSeed = seed?.let { "$title$it" }

            val destructuredRequest = reqUrl.split("*").map { URLDecoder.decode(it, "utf-8") }

            val puzzle = destructuredRequest[0]
            val countStr = destructuredRequest.getOrNull(1) ?: "1"
            val copiesStr = destructuredRequest.getOrNull(2) ?: "1"
            val scheme = destructuredRequest.getOrNull(3) ?: ""

            val decodedTitle = URLDecoder.decode(title, "utf-8")

            val scrambler by PuzzlePlugins.PUZZLES[puzzle]
                ?: throw InvalidScrambleRequestException("Invalid scrambler: $puzzle")

            val scrambleCacher = SCRAMBLE_CACHERS.getOrPut(puzzle) { ScrambleCacher(scrambler) }

            val fmc = countStr == "fmc"

            val count: Int = if (fmc) 1 else min(countStr.toInt(), MAX_COUNT)

            val copies = min(copiesStr.toInt(), MAX_COPIES)

            val genScrambles = uniqueSeed?.let { scrambler.generateSeededScrambles(seed, count) }
                ?: scrambleCacher.newScrambles(count)

            val scrambles = genScrambles.toList()

            val colorScheme = scrambler.parseColorScheme(scheme)

            return empty(scrambler).copy(
                scrambles = scrambles,
                copies = copies,
                title = decodedTitle,
                fmc = fmc,
                colorScheme = colorScheme
            )
        }

        private fun defaultZipParameters(useEncryption: Boolean = false) = ZipParameters().apply {
            compressionMethod = CompressionMethod.DEFLATE
            compressionLevel = CompressionLevel.NORMAL

            if (useEncryption) {
                isEncryptFiles = true
                encryptionMethod = EncryptionMethod.ZIP_STANDARD
            }
        }

        private tailrec fun String.toUniqueTitle(seenTitles: List<String>, suffixSalt: Int = 0): String {
            val suffixedTitle = "$this (${suffixSalt})"
                .takeUnless { suffixSalt == 0 } ?: this

            if (suffixedTitle !in seenTitles) {
                return suffixedTitle
            }

            return toUniqueTitle(seenTitles, suffixSalt + 1)
        }

        fun ZipOutputStream.putFileEntry(fileName: String, contents: ByteArray, parameters: ZipParameters = defaultZipParameters()) {
            parameters.fileNameInZip = fileName

            putNextEntry(parameters)
            write(contents)

            closeEntry()
        }

        private val PDF_CACHE = mutableMapOf<ScrambleRequest, PdfContent>()

        fun requestsToZip(globalTitle: String?, generationDate: LocalDate, versionTag: String, scrambleRequests: List<ScrambleRequest>, password: String?, generationUrl: String?, wcif: WCIF?): ByteArrayOutputStream {
            val baosZip = ByteArrayOutputStream()

            val usePassword = password != null
            val parameters = defaultZipParameters(usePassword)

            val zipOut = password?.let { ZipOutputStream(baosZip, it.toCharArray()) }
                ?: ZipOutputStream(baosZip)

            val seenTitles = mutableListOf<String>()

            // Computer display zip
            // This .zip file is nested in the main .zip. It is intentionally not
            // protected with a password, since it's just an easy way to distribute
            // a collection of files that are each are encrypted using their own passcode.
            val computerDisplayBaosZip = ByteArrayOutputStream()

            val computerDisplayZipParameters = defaultZipParameters()
            val computerDisplayZipOut = ZipOutputStream(computerDisplayBaosZip)

            val safeGlobalTitle = globalTitle?.toFileSafeString()
            val computerDisplayFileName = "$safeGlobalTitle - Computer Display PDFs"

            val fmcBeingHeld = scrambleRequests.any { it.fmc }

            if (fmcBeingHeld) {
                val zipName = "Printing/Fewest Moves - Additional Files/3x3x3 Fewest Moves Solution Sheet.pdf"

                val sheet = FmcGenericSolutionSheet(empty(ThreeByThreeCubePuzzle()), globalTitle, Translate.DEFAULT_LOCALE)

                zipOut.putFileEntry(zipName, sheet.render(), parameters)
            }

            val passcodes = mutableMapOf<String, String>()

            for (scrambleRequest in scrambleRequests) {
                val fileTitle = scrambleRequest.title.toFileSafeString()
                val safeTitle = fileTitle.toUniqueTitle(seenTitles)

                seenTitles += safeTitle

                // Without passcode, for printing
                val pdfPrintingZipName = "Printing/Scramble Sets/$safeTitle.pdf"
                val pdfPrintingByteStream = scrambleRequest.createPdf(globalTitle, generationDate, versionTag, Translate.DEFAULT_LOCALE)

                zipOut.putFileEntry(pdfPrintingZipName, pdfPrintingByteStream.render(), parameters)

                // register in cache to speed up overall generation process
                PDF_CACHE[scrambleRequest] = pdfPrintingByteStream

                // With passcode, for computer display
                val passcode = randomPasscode()
                passcodes[safeTitle] = passcode

                val computerDisplayZipName = "$computerDisplayFileName/$safeTitle.pdf"

                computerDisplayZipOut.putFileEntry(computerDisplayZipName, pdfPrintingByteStream.render(passcode), computerDisplayZipParameters)

                val txtZipName = "Interchange/txt/$safeTitle.txt"
                val txtScrambles = scrambleRequest.allScrambles.stripNewlines().joinToString("\r\n")

                zipOut.putFileEntry(txtZipName, txtScrambles.toByteArray(), parameters)

                // i18n is only for fmc
                if (!scrambleRequest.fmc) {
                    continue
                }

                val cutoutZipName = "Printing/Fewest Moves - Additional Files/$safeTitle - Scramble Cutout Sheet.pdf"
                val cutoutSheet = FmcScrambleCutoutSheet(scrambleRequest, globalTitle)

                zipOut.putFileEntry(cutoutZipName, cutoutSheet.render(password), parameters)

                for (locale in Translate.locales) {
                    // fewest moves regular sheet
                    val printingPdfZipName = "Printing/Fewest Moves - Additional Files/Translations/${locale.toLanguageTag()}_$safeTitle.pdf"
                    val printingSheet = FmcSolutionSheet(scrambleRequest, globalTitle, locale)

                    zipOut.putFileEntry(printingPdfZipName, printingSheet.render(password), parameters)

                    // Generic sheet.
                    val genericPrintingPdfZipName = "Printing/Fewest Moves - Additional Files/Translations/${locale.toLanguageTag()}_$safeTitle Solution Sheet.pdf"
                    val genericPrintingSheet = FmcGenericSolutionSheet(scrambleRequest, globalTitle, locale)

                    zipOut.putFileEntry(genericPrintingPdfZipName, genericPrintingSheet.render(password), parameters)
                }
            }

            if (wcif != null) {
                val schedule = wcif.schedule
                OrderedScrambles.generateOrderedScrambles(scrambleRequests, globalTitle, generationDate, versionTag, zipOut, parameters, schedule)
            }

            computerDisplayZipOut.close()

            val computerDisplayZipName = "$computerDisplayFileName.zip"
            zipOut.putFileEntry(computerDisplayZipName, computerDisplayBaosZip.toByteArray(), parameters)

            val txtFileName = "$safeGlobalTitle - Computer Display PDF Passcodes - SECRET.txt"
            val passcodeList = passcodes.entries.joinToString("\r\n") { "${it.key}: ${it.value}" }

            val templateContent = ScrambleRequest::class.java.getResourceAsStream("/text/passcodeTemplate.txt").bufferedReader().readText()
                .replace("%%GLOBAL_TITLE%%", globalTitle.orEmpty())
                .replace("%%PASSCODES%%", passcodeList)

            zipOut.putFileEntry(txtFileName, templateContent.toByteArray(), parameters)

            val jsonFileName = "Interchange/$safeGlobalTitle.json"

            val jsonObj = mapOf(
                "sheets" to scrambleRequests,
                "competitionName" to globalTitle,
                "version" to versionTag,
                "generationDate" to generationDate,
                "generationUrl" to generationUrl,
                "schedule" to wcif?.schedule
            ).filterValues { it != null }

            val jsonStr = GSON.toJson(jsonObj)
            zipOut.putFileEntry(jsonFileName, jsonStr.toByteArray(), parameters)

            val jsonpFileName = "Interchange/$safeGlobalTitle.jsonp"
            val jsonp = "var SCRAMBLES_JSON = $jsonStr;"

            zipOut.putFileEntry(jsonpFileName, jsonp.toByteArray(), parameters)

            val htmlZipName = "Interchange/$safeGlobalTitle.html"

            val viewerResource = ScrambleRequest::class.java.getResourceAsStream(HTML_SCRAMBLE_VIEWER).bufferedReader().readText()
                .replace("%SCRAMBLES_JSONP_FILENAME%", jsonpFileName)

            zipOut.putFileEntry(htmlZipName, viewerResource.toByteArray(), parameters)

            val printingCompleteZipName = "Printing/$safeGlobalTitle - All Scrambles.pdf"

            // Note that we're not passing the password into this function. It seems pretty silly
            // to put a password protected pdf inside of a password protected zip file.
            val printingCompleteSheet = requestsToCompletePdf(globalTitle, generationDate, versionTag, scrambleRequests)
            zipOut.putFileEntry(printingCompleteZipName, printingCompleteSheet.render(), parameters)

            zipOut.close()

            return baosZip
        }

        fun requestsToCompletePdf(globalTitle: String?, generationDate: LocalDate, versionTag: String, scrambleRequests: List<ScrambleRequest>): PdfContent {
            val originalPdfs = scrambleRequests.map {
                PDF_CACHE.getOrPut(it) { it.createPdf(globalTitle, generationDate, versionTag, Translate.DEFAULT_LOCALE) }
            }

            val configurations = scrambleRequests.map { Triple(it.title, it.scrambler.longName, it.copies) }

            return MergedPdfWithOutline(originalPdfs, configurations, globalTitle)
        }
    }
}
