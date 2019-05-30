package org.worldcubeassociation.tnoodle.server.webscrambles

import com.itextpdf.text.*
import com.itextpdf.text.pdf.*
import net.gnehzr.tnoodle.puzzle.CubePuzzle
import net.gnehzr.tnoodle.scrambles.Puzzle
import net.gnehzr.tnoodle.scrambles.ScrambleCacher
import net.lingala.zip4j.io.ZipOutputStream
import net.lingala.zip4j.model.ZipParameters
import net.lingala.zip4j.util.Zip4jConstants
import org.joda.time.DateTime
import org.worldcubeassociation.tnoodle.server.util.GsonUtil.GSON
import org.worldcubeassociation.tnoodle.server.util.WebServerUtils
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.PdfSheetUtil.addFmcScrambleCutoutSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.PdfSheetUtil.addFmcSolutionSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.PdfSheetUtil.addGenericFmcSolutionSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.PdfSheetUtil.addScrambles
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.StringUtil.randomPasscode
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.StringUtil.stripNewlines
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.StringUtil.toFileSafeString
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.OrderedScrambles
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFHelper
import java.io.ByteArrayOutputStream
import java.net.URLDecoder
import java.util.*
import kotlin.math.min
import net.gnehzr.tnoodle.svglite.Color as SVGColor

data class ScrambleRequest(
    val scrambles: List<String>,
    val extraScrambles: List<String>,
    val scrambler: Puzzle,
    val copies: Int,
    val title: String,
    val fmc: Boolean,
    val colorScheme: HashMap<String, SVGColor>?,
    // totalAttempt and attempt are useful for when we have multiple attempts split in the schedule.
    // Usually, tnoodle prints scrambles for a ScrambleRequest iterating over ScrambleRequest.scrambles.
    // So, if ScrambleRequest.scrambles.length == 3, tnoodle prints Scramble 1 of 3, Scramble 2 of 3 and Scramble 3 of 3.
    // But for OrderedScrambles, these scrambles are split on the schedule, so we replace Scramble.scrambles = {Scramble.scrambles[attempt]}.
    // To continue printing Scramble x of y, we use attempt as x and totalAttempt as y.
    var roundStartTime: DateTime?,
    var totalAttempt: Int,
    var attempt: Int,

    // The following attributes are here purely so the scrambler ui
    // can pass these straight to the generated JSON we put in the
    // zip file. This makes it easier to align that JSON with the rounds
    // of a competition.
    val group: String?, // This legacy field is still used by the WCA Workbook Assistant. When we get rid of the WA, we can get rid of this.
    val scrambleSetId: String?,
    val event: String,
    val round: Int
) : Comparable<ScrambleRequest> {
    val allScrambles get() = scrambles + extraScrambles

    // This is here just to make GSON work.
    constructor() : this(
        listOf(),
        listOf(),
        CubePuzzle(2), // FIXME
        0,
        "",
        false,
        null,
        null,
        0,
        0,
        null,
        null,
        "",
        0
    )

    override fun compareTo(other: ScrambleRequest): Int {
        return this.roundStartTime!!.compareTo(other.roundStartTime)
    }

    companion object {
        private val HTML_SCRAMBLE_VIEWER = "/wca/scrambleviewer.html"

        private val MAX_COUNT = 100
        private val MAX_COPIES = 100

        private val SCRAMBLE_CACHERS = mutableMapOf<String, ScrambleCacher>()
        private var PLUGIN_PUZZLES = PuzzlePlugins.PUZZLES

        fun parseScrambleRequests(query: Map<String, String>, seed: String?): List<ScrambleRequest> {
            if (query.isEmpty()) {
                throw InvalidScrambleRequestException("Must specify at least one scramble request")
            } else {
                return query.map { (title, reqUrl) ->
                    // Note that we prefix the seed with the title of the round! This ensures that we get unique
                    // scrambles in different rounds. Thanks to Ravi Fernando for noticing this at Stanford Fall 2011.
                    // (http://www.worldcubeassociation.org/results/c.php?i=StanfordFall2011).
                    val uniqueSeed = seed?.let { "$title$it" }

                    val destructuringIsStupidParts = reqUrl.split("*").map { URLDecoder.decode(it, "utf-8") }

                    val puzzle = destructuringIsStupidParts[0]
                    val countStr = destructuringIsStupidParts.getOrNull(1) ?: "1"
                    val copiesStr = destructuringIsStupidParts.getOrNull(2) ?: "1"
                    val scheme = destructuringIsStupidParts.getOrNull(3) ?: ""

                    val decodedTitle = URLDecoder.decode(title, "utf-8")

                    val scrambler = PLUGIN_PUZZLES[puzzle] ?: throw InvalidScrambleRequestException("Invalid scrambler: $puzzle")

                    val scrambleCacher = SCRAMBLE_CACHERS.getOrPut(puzzle) { ScrambleCacher(scrambler) }

                    val fmc = countStr == "fmc"

                    val count: Int = if (fmc) 1 else min(countStr.toInt(), MAX_COUNT)

                    val copies = min(copiesStr.toInt(), MAX_COPIES)

                    val genScrambles = uniqueSeed?.let { scrambler.generateSeededScrambles(seed, count) }
                        ?: scrambleCacher.newScrambles(count)

                    val scrambles = genScrambles.toList()

                    val colorScheme = scrambler.parseColorScheme(scheme)

                    ScrambleRequest(
                        scrambles,
                        listOf(),
                        scrambler,
                        copies,
                        decodedTitle,
                        fmc,
                        colorScheme,
                        null,
                        0, 0, null, null, "", 0 // FIXME
                    )
                }
            }
        }

        private fun createPdf(globalTitle: String?, creationDate: Date, scrambleRequest: ScrambleRequest, locale: Locale, password: String?): ByteArrayOutputStream {
            // 333mbf is handled pretty specially: each "scramble" is actually a newline separated
            // list of 333ni scrambles.
            // If we detect that we're dealing with 333mbf, then we will generate 1 sheet per attempt,
            // rather than 1 sheet per round (as we do with every other event).

            // for ordered scrambles, we recreate scrambleRequest so it contains only 1 scramble
            // to fix this, we pass the attempt number
            val is333mbf = scrambleRequest.event == "333mbf"

            if (is333mbf) {
                val doc = Document()
                val totalPdfOutput = ByteArrayOutputStream()
                val totalPdfWriter = PdfSmartCopy(doc, totalPdfOutput)
                if (password != null) {
                    totalPdfWriter.setEncryption(password.toByteArray(), password.toByteArray(), PdfWriter.ALLOW_PRINTING, PdfWriter.STANDARD_ENCRYPTION_128)
                }
                doc.open()

                for (nthAttempt in 1..scrambleRequest.scrambles.size) {
                    val scrambles = scrambleRequest.scrambles[nthAttempt - 1].split("\n")

                    val attemptRequest = scrambleRequest.copy(
                        scrambles = scrambles,
                        extraScrambles = listOf(),
                        title = scrambleRequest.title + " Attempt " + if (scrambleRequest.attempt > 1) scrambleRequest.attempt else nthAttempt,
                        fmc = false,
                        event = "333bf"
                    )

                    // We pass a null password, since the resulting pages will be processed further before encryption.
                    val pdfReader = PdfReader(createPdf(globalTitle, creationDate, attemptRequest, locale, null).toByteArray())
                    for (pageN in 1..pdfReader.numberOfPages) {
                        val page = totalPdfWriter.getImportedPage(pdfReader, pageN)
                        totalPdfWriter.addPage(page)
                    }
                }
                doc.close()
                return totalPdfOutput
            }

            assert(scrambleRequest.scrambles.isNotEmpty())
            var pdfOut = ByteArrayOutputStream()
            val pageSize = PageSize.LETTER
            var doc = Document(pageSize, 0f, 0f, 75f, 75f)
            var docWriter = PdfWriter.getInstance(doc, pdfOut)
            if (scrambleRequest.fmc && password != null) {
                // We don't watermark the FMC sheets because they already have
                // the competition name on them. So we encrypt directly.
                docWriter.setEncryption(password.toByteArray(), password.toByteArray(), PdfWriter.ALLOW_PRINTING, PdfWriter.STANDARD_ENCRYPTION_128)
            }

            docWriter.setBoxSize("art", Rectangle(36f, 54f, pageSize.width - 36, pageSize.height - 54))

            doc.addCreationDate()
            doc.addProducer()
            if (globalTitle != null) {
                doc.addTitle(globalTitle)
            }

            doc.open()
            // Note that we ignore scrambleRequest.copies here.
            addScrambles(docWriter, doc, scrambleRequest, globalTitle, locale)
            doc.close()

            if (scrambleRequest.fmc) {
                // We don't watermark the FMC sheets because they already have
                // the competition name on them.
                return pdfOut
            }
            // TODO - is there a better way to convert from a PdfWriter to a PdfReader?
            val pr = PdfReader(pdfOut.toByteArray())

            pdfOut = ByteArrayOutputStream()
            doc = Document(pageSize, 0f, 0f, 75f, 75f)
            docWriter = PdfWriter.getInstance(doc, pdfOut)
            if (password != null) {
                docWriter.setEncryption(password.toByteArray(), password.toByteArray(), PdfWriter.ALLOW_PRINTING, PdfWriter.STANDARD_ENCRYPTION_128)
            }
            doc.open()

            val cb = docWriter.directContent

            for (pageN in 1..pr.numberOfPages) {
                val page = docWriter.getImportedPage(pr, pageN)

                doc.newPage()
                cb.addTemplate(page, 0f, 0f)

                val rect = pr.getBoxSize(pageN, "art")

                // Header
                ColumnText.showTextAligned(cb,
                    Element.ALIGN_LEFT, Phrase(WebServerUtils.SDF.format(creationDate)),
                    rect.left, rect.top, 0f)

                ColumnText.showTextAligned(cb,
                    Element.ALIGN_CENTER, Phrase(globalTitle),
                    (pageSize.left + pageSize.right) / 2, pageSize.top - 60, 0f)

                ColumnText.showTextAligned(cb,
                    Element.ALIGN_CENTER, Phrase(scrambleRequest.title),
                    (pageSize.left + pageSize.right) / 2, pageSize.top - 45, 0f)

                if (pr.numberOfPages > 1) {
                    ColumnText.showTextAligned(cb,
                        Element.ALIGN_RIGHT, Phrase(pageN.toString() + "/" + pr.numberOfPages),
                        rect.right, rect.top, 0f)
                }

                // Footer
                val generatedBy = "Generated by " + WebServerUtils.projectName + "-" + WebServerUtils.version
                ColumnText.showTextAligned(cb,
                    Element.ALIGN_CENTER, Phrase(generatedBy),
                    (pageSize.left + pageSize.right) / 2, pageSize.bottom + 40, 0f)
            }

            doc.close()

            // TODO - is there a better way to convert from a PdfWriter to a PdfReader?
            return pdfOut

            //      The PdfStamper class doesn't seem to be working.
            //      pdfOut = new ByteArrayOutputStream();
            //      PdfStamper ps = new PdfStamper(pr, pdfOut);
            //
            //      for(int pageN = 1; pageN <= pr.getNumberOfPages(); pageN++) {
            //          PdfContentByte pb = ps.getUnderContent(pageN);
            //          Rectangle rect = pr.getBoxSize(pageN, "art");
            //          System.out.println(rect.getLeft());
            //          System.out.println(rect.getWidth());
            //          ColumnText.showTextAligned(pb,
            //                  Element.ALIGN_LEFT, new Phrase("Hello people!"), 36, 540, 0);
            ////            ColumnText.showTextAligned(pb,
            ////                    Element.ALIGN_CENTER, new Phrase("HELLO WORLD"),
            ////                    (rect.getLeft() + rect.getRight()) / 2, rect.getTop(), 0);
            //      }
            //      ps.close();
            //      return ps.getReader();
        }

        fun requestsToZip(globalTitle: String?, generationDate: Date, scrambleRequests: List<ScrambleRequest>, password: String?, generationUrl: String?, wcifHelper: WCIFHelper?): ByteArrayOutputStream {
            val baosZip = ByteArrayOutputStream()

            val parameters = ZipParameters()
            parameters.compressionMethod = Zip4jConstants.COMP_DEFLATE
            parameters.compressionLevel = Zip4jConstants.DEFLATE_LEVEL_NORMAL
            if (password != null) {
                parameters.isEncryptFiles = true
                parameters.encryptionMethod = Zip4jConstants.ENC_METHOD_STANDARD
                parameters.setPassword(password)
            }
            parameters.isSourceExternalStream = true

            val zipOut = ZipOutputStream(baosZip)
            val seenTitles = HashMap<String, Boolean>()

            // Computer display zip
            // This .zip file is nested in the main .zip. It is intentionally not
            // protected with a password, since it's just an easy way to distribute
            // a collection of files that are each are encrypted using their own
            // passcode.
            val computerDisplayBaosZip = ByteArrayOutputStream()
            val computerDisplayZipParameters = ZipParameters()
            computerDisplayZipParameters.compressionMethod = Zip4jConstants.COMP_DEFLATE
            computerDisplayZipParameters.compressionLevel = Zip4jConstants.DEFLATE_LEVEL_NORMAL
            computerDisplayZipParameters.isSourceExternalStream = true
            val computerDisplayZipOut = ZipOutputStream(computerDisplayBaosZip)

            val safeGlobalTitle = toFileSafeString(globalTitle!!)
            val computerDisplayFileName = "$safeGlobalTitle - Computer Display PDFs"

            var fmcBeingHeld = false
            for (scrambleRequest in scrambleRequests) {
                if (scrambleRequest.fmc) {
                    fmcBeingHeld = true

                    var safeTitle = toFileSafeString(scrambleRequest.title) + " - Scramble Cutout Sheet"
                    var salt = 0
                    var tempNewSafeTitle = safeTitle
                    while (seenTitles[tempNewSafeTitle] != null) {
                        tempNewSafeTitle = safeTitle + " (" + ++salt + ")"
                    }
                    safeTitle = tempNewSafeTitle
                    seenTitles[safeTitle] = true

                    val pdfFileName = "Printing/Fewest Moves - Additional Files/$safeTitle.pdf"
                    parameters.fileNameInZip = pdfFileName
                    zipOut.putNextEntry(null, parameters)

                    val pdfOut = ByteArrayOutputStream()
                    val pageSize = PageSize.LETTER
                    val doc = Document(pageSize, 0f, 0f, 75f, 75f)
                    val docWriter = PdfWriter.getInstance(doc, pdfOut)

                    docWriter.setBoxSize("art", Rectangle(36f, 54f, pageSize.width - 36, pageSize.height - 54))

                    doc.addCreationDate()
                    doc.addProducer()
                    if (globalTitle != null) {
                        doc.addTitle(globalTitle)
                    }

                    // TODO: i18n. See https://github.com/thewca/tnoodle/issues/396
                    doc.open()
                    for (i in scrambleRequest.scrambles.indices) {
                        addFmcScrambleCutoutSheet(docWriter, doc, scrambleRequest, globalTitle, i)
                    }
                    doc.close()

                    val pdfReader = PdfReader(pdfOut.toByteArray())
                    val b = ByteArray(pdfReader.fileLength.toInt())
                    pdfReader.safeFile.readFully(b)
                    zipOut.write(b)

                    zipOut.closeEntry()
                }
            }
            if (fmcBeingHeld) {
                val pdfFileName = "Printing/Fewest Moves - Additional Files/3x3x3 Fewest Moves Solution Sheet.pdf"
                parameters.fileNameInZip = pdfFileName
                zipOut.putNextEntry(null, parameters)

                val pdfOut = ByteArrayOutputStream()
                val pageSize = PageSize.LETTER
                val doc = Document(pageSize, 0f, 0f, 75f, 75f)
                val docWriter = PdfWriter.getInstance(doc, pdfOut)

                docWriter.setBoxSize("art", Rectangle(36f, 54f, pageSize.width - 36, pageSize.height - 54))

                doc.addCreationDate()
                doc.addProducer()
                if (globalTitle != null) {
                    doc.addTitle(globalTitle)
                }

                doc.open()
                // FIXME
                addGenericFmcSolutionSheet(docWriter, doc, scrambleRequests.random(), globalTitle, Translate.DEFAULT_LOCALE)
                doc.close()

                // TODO - is there a better way to convert from a PdfWriter to a PdfReader?
                val pdfReader = PdfReader(pdfOut.toByteArray())
                val b = ByteArray(pdfReader.fileLength.toInt())
                pdfReader.safeFile.readFully(b)
                zipOut.write(b)

                zipOut.closeEntry()
            }

            val passcodes = LinkedHashMap<String, String>()

            for (scrambleRequest in scrambleRequests) {
                var safeTitle = toFileSafeString(scrambleRequest.title)
                var salt = 0
                var tempNewSafeTitle = safeTitle
                while (seenTitles[tempNewSafeTitle] != null) {
                    tempNewSafeTitle = safeTitle + " (" + ++salt + ")"
                }
                safeTitle = tempNewSafeTitle
                seenTitles[safeTitle] = true

                // Without passcode, for printing
                var pdfFileName = "Printing/Scramble Sets/$safeTitle.pdf"
                parameters.fileNameInZip = pdfFileName
                zipOut.putNextEntry(null, parameters)
                var pdfByteStream = createPdf(globalTitle, generationDate, scrambleRequest, Translate.DEFAULT_LOCALE, null)
                zipOut.write(pdfByteStream.toByteArray())
                zipOut.closeEntry()

                // With passcode, for computer display
                val passcode = randomPasscode()
                passcodes[safeTitle] = passcode

                pdfFileName = "$computerDisplayFileName/$safeTitle.pdf"
                computerDisplayZipParameters.fileNameInZip = pdfFileName
                computerDisplayZipOut.putNextEntry(null, computerDisplayZipParameters)
                pdfByteStream = createPdf(globalTitle, generationDate, scrambleRequest, Translate.DEFAULT_LOCALE, passcode)
                computerDisplayZipOut.write(pdfByteStream.toByteArray())
                computerDisplayZipOut.closeEntry()

                val txtFileName = "Interchange/txt/$safeTitle.txt"
                parameters.fileNameInZip = txtFileName
                zipOut.putNextEntry(null, parameters)
                zipOut.write(stripNewlines(scrambleRequest.allScrambles).joinToString("\r\n").toByteArray())
                zipOut.closeEntry()

                // i18n is only for fmc
                if (!scrambleRequest.fmc) {
                    continue
                }

                for (locale in Translate.locales) {
                    // fewest moves regular sheet
                    pdfFileName = "Printing/Fewest Moves - Additional Files/Translations/" + locale.toLanguageTag() + "_" + safeTitle + ".pdf"
                    parameters.fileNameInZip = pdfFileName
                    zipOut.putNextEntry(null, parameters)

                    var pdfOut = ByteArrayOutputStream()
                    var pageSize = PageSize.LETTER
                    var doc = Document(pageSize, 0f, 0f, 75f, 75f)
                    var docWriter = PdfWriter.getInstance(doc, pdfOut)

                    docWriter.setBoxSize("art", Rectangle(36f, 54f, pageSize.width - 36, pageSize.height - 54))

                    doc.addCreationDate()
                    doc.addProducer()
                    if (globalTitle != null) {
                        doc.addTitle(globalTitle)
                    }

                    doc.open()
                    for (i in scrambleRequest.scrambles.indices) {
                        addFmcSolutionSheet(docWriter, doc, scrambleRequest, globalTitle, i, locale)
                    }
                    doc.close()

                    var pdfReader = PdfReader(pdfOut.toByteArray())
                    var b = ByteArray(pdfReader.fileLength.toInt())
                    pdfReader.safeFile.readFully(b)
                    zipOut.write(b)

                    zipOut.closeEntry()

                    // Generic sheet.
                    pdfFileName = "Printing/Fewest Moves - Additional Files/Translations/" + locale.toLanguageTag() + "_" + safeTitle + " Solution Sheet.pdf"
                    parameters.fileNameInZip = pdfFileName
                    zipOut.putNextEntry(null, parameters)

                    pdfOut = ByteArrayOutputStream()
                    pageSize = PageSize.LETTER
                    doc = Document(pageSize, 0f, 0f, 75f, 75f)
                    docWriter = PdfWriter.getInstance(doc, pdfOut)

                    docWriter.setBoxSize("art", Rectangle(36f, 54f, pageSize.width - 36, pageSize.height - 54))

                    doc.addCreationDate()
                    doc.addProducer()
                    if (globalTitle != null) {
                        doc.addTitle(globalTitle)
                    }

                    // there's no need to generate 1 per round, since the fields can be filled
                    doc.open()
                    addGenericFmcSolutionSheet(docWriter, doc, scrambleRequest, globalTitle, locale)
                    doc.close()

                    pdfReader = PdfReader(pdfOut.toByteArray())
                    b = ByteArray(pdfReader.fileLength.toInt())
                    pdfReader.safeFile.readFully(b)
                    zipOut.write(b)

                    zipOut.closeEntry()
                }
            }

            OrderedScrambles.generateOrderedScrambles(globalTitle, generationDate, zipOut, parameters, wcifHelper)

            computerDisplayZipOut.finish()
            computerDisplayZipOut.close()
            parameters.fileNameInZip = "$computerDisplayFileName.zip"
            zipOut.putNextEntry(null, parameters)
            zipOut.write(computerDisplayBaosZip.toByteArray())
            zipOut.closeEntry()

            val txtFileName = "$safeGlobalTitle - Computer Display PDF Passcodes - SECRET.txt"
            parameters.fileNameInZip = txtFileName
            zipOut.putNextEntry(null, parameters)
            val builder = StringBuilder()
            builder.append("SECRET SCRAMBLE SET PASSCODES\r\n")
            if (globalTitle != null) {
                builder.append(globalTitle)
                builder.append("\r\n")
            }
            builder.append("\r\n")
            builder.append("Make sure that only Delegates have access to this file.\r\n")
            builder.append("Give passcodes to scramblers when the corresponding\r\n")
            builder.append("groups begin (but not earlier). If you have to put\r\n")
            builder.append("someone else in charge of the passcodes temporarily,\r\n")
            builder.append("only give them the minimum amount of passcodes needed.\r\n")
            builder.append("\r\n")
            for ((key, value) in passcodes) {
                builder.append(String.format("%40s", key))
                builder.append(": ")
                builder.append(value)
                builder.append("\r\n")
            }
            zipOut.write(builder.toString().toByteArray())
            zipOut.closeEntry()

            val jsonFileName = "Interchange/$safeGlobalTitle.json"
            parameters.fileNameInZip = jsonFileName
            zipOut.putNextEntry(null, parameters)
            val jsonObj = HashMap<String, Any>()
            jsonObj["sheets"] = scrambleRequests
            jsonObj["competitionName"] = globalTitle
            jsonObj["version"] = WebServerUtils.projectName + "-" + WebServerUtils.version
            jsonObj["generationDate"] = generationDate

            if (generationUrl != null) {
                jsonObj["generationUrl"] = generationUrl
            }

            if (wcifHelper?.schedule != null) {
                jsonObj["schedule"] = wcifHelper.schedule
            }

            val json = GSON.toJson(jsonObj)
            zipOut.write(json.toByteArray())
            zipOut.closeEntry()

            val jsonpFileName = "Interchange/$safeGlobalTitle.jsonp"
            parameters.fileNameInZip = jsonpFileName
            zipOut.putNextEntry(null, parameters)
            val jsonp = "var SCRAMBLES_JSON = $json;"
            zipOut.write(jsonp.toByteArray())
            zipOut.closeEntry()

            parameters.fileNameInZip = "Interchange/$safeGlobalTitle.html"
            zipOut.putNextEntry(null, parameters)

            val viewerResource = ScrambleRequest::class.java.getResourceAsStream(HTML_SCRAMBLE_VIEWER)
            val sb = viewerResource.bufferedReader().lineSequence().map { it.replace("%SCRAMBLES_JSONP_FILENAME%", jsonpFileName) }
            zipOut.write(sb.joinToString("\n").toByteArray())
            zipOut.closeEntry()

            parameters.fileNameInZip = "Printing/$safeGlobalTitle - All Scrambles.pdf"
            zipOut.putNextEntry(null, parameters)
            // Note that we're not passing the password into this function. It seems pretty silly
            // to put a password protected pdf inside of a password protected zip file.
            val baos = requestsToPdf(globalTitle, generationDate, scrambleRequests, null)
            zipOut.write(baos.toByteArray())
            zipOut.closeEntry()

            zipOut.finish()
            zipOut.close()

            return baosZip
        }

        fun requestsToPdf(globalTitle: String?, generationDate: Date, scrambleRequests: List<ScrambleRequest>, password: String?): ByteArrayOutputStream {
            val doc = Document()

            val totalPdfOutput = ByteArrayOutputStream()
            val totalPdfWriter = PdfSmartCopy(doc, totalPdfOutput)

            if (password != null) {
                totalPdfWriter.setEncryption(password.toByteArray(), password.toByteArray(), PdfWriter.ALLOW_PRINTING, PdfWriter.STANDARD_ENCRYPTION_128)
            }

            doc.open()

            val cb = totalPdfWriter.directContent
            val root = cb.rootOutline

            val outlineByPuzzle = HashMap<String, PdfOutline>()
            val expandPuzzleLinks = false

            var pages = 1
            for (i in scrambleRequests.indices) {
                val scrambleRequest = scrambleRequests[i]

                val shortName = scrambleRequest.scrambler.shortName

                var puzzleLink: PdfOutline? = outlineByPuzzle[shortName]
                if (puzzleLink == null) {
                    val d = PdfDestination(PdfDestination.FIT)
                    puzzleLink = PdfOutline(root,
                        PdfAction.gotoLocalPage(pages, d, totalPdfWriter), scrambleRequest.scrambler.longName, expandPuzzleLinks)
                    outlineByPuzzle[shortName] = puzzleLink
                }

                val d = PdfDestination(PdfDestination.FIT)
                PdfOutline(puzzleLink,
                    PdfAction.gotoLocalPage(pages, d, totalPdfWriter), scrambleRequest.title)

                // We pass a null password, since the resulting pages will be processed further before encryption.
                val pdfReader = PdfReader(createPdf(globalTitle, generationDate, scrambleRequest, Translate.DEFAULT_LOCALE, null).toByteArray())

                for (j in 0 until scrambleRequest.copies) {
                    for (pageN in 1..pdfReader.numberOfPages) {
                        val page = totalPdfWriter.getImportedPage(pdfReader, pageN)
                        totalPdfWriter.addPage(page)
                        pages++
                    }
                }
            }

            doc.close()
            return totalPdfOutput
        }
    }
}
