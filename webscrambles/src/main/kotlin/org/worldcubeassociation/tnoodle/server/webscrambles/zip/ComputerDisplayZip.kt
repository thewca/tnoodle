package org.worldcubeassociation.tnoodle.server.webscrambles.zip

import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.StringUtil.randomPasscode
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.ZipArchive
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.ZipArchive.Companion.toUniqueTitles
import java.time.LocalDate

data class ComputerDisplayZip(val scrambleRequests: List<ScrambleRequest>) {
    val uniqueTitledRequests = scrambleRequests.toUniqueTitles()
    val passcodes = uniqueTitledRequests.mapValues { randomPasscode() }

    /**
     * Computer display zip
     *
     * This .zip file is nested in the main .zip. It is intentionally not
     * protected with a password, since it's just an easy way to distribute
     * a collection of files that are each are encrypted using their own passcode.
     */
    fun assemble(globalTitle: String?, generationDate: LocalDate, versionTag: String): ZipArchive {
        return zipArchive {
            for ((uniqueTitle, scrambleRequest) in uniqueTitledRequests) {
                val computerDisplayPdf = scrambleRequest.createPdf(globalTitle, generationDate, versionTag, Translate.DEFAULT_LOCALE)

                val passcode = passcodes.getValue(uniqueTitle)
                val computerDisplayBytes = computerDisplayPdf.render(passcode)

                file("$uniqueTitle.pdf", computerDisplayBytes)
            }
        }
    }
}
