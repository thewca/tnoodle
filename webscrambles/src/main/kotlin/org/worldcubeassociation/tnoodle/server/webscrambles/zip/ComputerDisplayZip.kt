package org.worldcubeassociation.tnoodle.server.webscrambles.zip

import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.StringUtil.randomPasscode
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFBuilder.getCachedPdf
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFBuilder.toScrambleSetData
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.ZipArchive
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.ZipArchive.Companion.withUniqueTitles
import java.time.LocalDate

data class ComputerDisplayZip(val wcif: Competition) {
    val scrambleSets = wcif.events.toScrambleSetData().withUniqueTitles()
    val passcodes = scrambleSets.mapValues { randomPasscode() }

    /**
     * Computer display zip
     *
     * This .zip file is nested in the main .zip. It is intentionally not
     * protected with a password, since it's just an easy way to distribute
     * a collection of files that are each are encrypted using their own passcode.
     */
    fun assemble(generationDate: LocalDate, versionTag: String): ZipArchive {
        return zipArchive {
            for ((uniqueTitle, scrambleData) in scrambleSets) {
                val computerDisplayPdf = scrambleData.getCachedPdf(generationDate, versionTag, Translate.DEFAULT_LOCALE)

                val passcode = passcodes.getValue(uniqueTitle)
                val computerDisplayBytes = computerDisplayPdf.render(passcode)

                file("$uniqueTitle.pdf", computerDisplayBytes)
            }
        }
    }
}
