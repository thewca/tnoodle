package org.worldcubeassociation.tnoodle.server.zip

import org.worldcubeassociation.tnoodle.server.pdf.ScrambleSheet
import org.worldcubeassociation.tnoodle.server.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.wcif.util.MatchedActivity
import org.worldcubeassociation.tnoodle.server.wcif.util.MatchedActivity.Companion.orderedScrambleSheets
import org.worldcubeassociation.tnoodle.server.zip.model.ZipArchive
import org.worldcubeassociation.tnoodle.server.zip.model.dsl.zipArchive
import org.worldcubeassociation.tnoodle.server.zip.util.StringUtil.toFileSafeString
import java.time.LocalDateTime
import java.util.*

data class ScrambleZip(
    val competition: Competition,
    val namedSheets: Map<String, ScrambleSheet>,
    val fmcTranslations: List<Locale>,
    val watermark: String?
) {
    private val globalTitle get() = competition.shortName

    fun assemble(
        generationDate: LocalDateTime,
        versionTag: String,
        pdfPassword: String?,
        generationUrl: String?
    ): ZipArchive {
        val computerDisplayZip = ComputerDisplayZip(namedSheets, globalTitle)
        val computerDisplayZipBytes = computerDisplayZip.assemble()

        val interchangeFolder = InterchangeFolder(competition, namedSheets, globalTitle)
        val interchangeFolderNode = interchangeFolder.assemble(generationDate, versionTag, generationUrl)

        val printingFolder = PrintingFolder(competition, namedSheets, fmcTranslations, watermark)
        val printingFolderNode = printingFolder.assemble(pdfPassword)

        val passcodeListingTxt = writePasscodeTemplate(namedSheets.toList())

        // The following lines sort passwords so delegates can linearly read them.
        // This is inspired by https://github.com/simonkellly/scramble-organizer
        // which may become deprecated after this so we are giving credit here.

        val matchedScrambleSheets = MatchedActivity.matchActivities(competition.schedule, namedSheets.values.toList())
        val orderedScrambleSheets = matchedScrambleSheets.orderedScrambleSheets

        val passcodesOrdered = namedSheets.toList()
            .sortedBy { orderedScrambleSheets.indexOf(it.second) }

        val orderedPasscodeListingTxt = writePasscodeTemplate(passcodesOrdered)

        val filesafeGlobalTitle = globalTitle.toFileSafeString()

        return zipArchive {
            folder(printingFolderNode)
            folder(interchangeFolderNode)

            file("$filesafeGlobalTitle - Computer Display PDFs.zip", computerDisplayZipBytes.compress())
            file("$filesafeGlobalTitle - Computer Display PDF Passcodes - SECRET.txt", passcodeListingTxt)

            if (orderedScrambleSheets.isNotEmpty()) {
                file("$filesafeGlobalTitle - ORDERED Computer Display PDF Passcodes - SECRET.txt", orderedPasscodeListingTxt)
            }
        }
    }

    private fun writePasscodeTemplate(namedSheets: List<Pair<String, ScrambleSheet>>): String {
        val resourceTemplate = this::class.java.getResourceAsStream(TXT_PASSCODE_TEMPLATE)
            .bufferedReader()
            .readText()
            .replace("%%GLOBAL_TITLE%%", globalTitle)

        val passcodeList = namedSheets
            .joinToString("\r\n") { "${it.first}: ${it.second.localPasscode}" }

        return resourceTemplate.replace("%%PASSCODES%%", passcodeList)
    }

    companion object {
        private val TXT_PASSCODE_TEMPLATE = "/text/passcodeTemplate.txt"
    }
}
