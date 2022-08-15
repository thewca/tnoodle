package org.worldcubeassociation.tnoodle.server.zip

import org.worldcubeassociation.tnoodle.server.pdf.ScrambleSheet
import org.worldcubeassociation.tnoodle.core.model.wcif.Competition
import org.worldcubeassociation.tnoodle.core.model.zip.ZipArchive
import org.worldcubeassociation.tnoodle.core.model.zip.dsl.zipArchive
import org.worldcubeassociation.tnoodle.server.zip.util.FileStringUtil.toFileSafeString
import org.worldcubeassociation.tnoodle.server.zip.util.ZipCompressionUtil.compress
import java.time.LocalDateTime
import java.util.Locale

data class ScrambleZip(
    val wcif: Competition,
    val namedSheets: Map<String, ScrambleSheet>,
    val fmcTranslations: List<Locale>,
    val watermark: String?
) {
    private val globalTitle get() = wcif.shortName

    fun assemble(generationDate: LocalDateTime, versionTag: String, pdfPassword: String?, generationUrl: String?): ZipArchive {
        val computerDisplayZip = ComputerDisplayZip(namedSheets, globalTitle)
        val computerDisplayZipBytes = computerDisplayZip.assemble()

        val interchangeFolder = InterchangeFolder(wcif, namedSheets, globalTitle)
        val interchangeFolderNode = interchangeFolder.assemble(generationDate, versionTag, generationUrl)

        val printingFolder = PrintingFolder(wcif, namedSheets, fmcTranslations, watermark)
        val printingFolderNode = printingFolder.assemble(pdfPassword)

        val passcodeList = computerDisplayZip.passcodes.entries
            .joinToString("\r\n") { "${it.key}: ${it.value}" }

        val passcodeListingTxt = this::class.java.getResourceAsStream(TXT_PASSCODE_TEMPLATE)
            .bufferedReader().readText()
            .replace("%%GLOBAL_TITLE%%", globalTitle)
            .replace("%%PASSCODES%%", passcodeList)

        val filesafeGlobalTitle = globalTitle.toFileSafeString()

        return zipArchive {
            folder(printingFolderNode)
            folder(interchangeFolderNode)

            file("$filesafeGlobalTitle - Computer Display PDFs.zip", computerDisplayZipBytes.compress())
            file("$filesafeGlobalTitle - Computer Display PDF Passcodes - SECRET.txt", passcodeListingTxt)
        }
    }

    companion object {
        private val TXT_PASSCODE_TEMPLATE = "/text/passcodeTemplate.txt"
    }
}
