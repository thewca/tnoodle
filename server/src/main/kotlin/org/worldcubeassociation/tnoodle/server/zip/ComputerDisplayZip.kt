package org.worldcubeassociation.tnoodle.server.zip

import org.worldcubeassociation.tnoodle.server.pdf.ScrambleSheet
import org.worldcubeassociation.tnoodle.server.zip.model.ZipArchive
import org.worldcubeassociation.tnoodle.server.zip.model.dsl.zipArchive

data class ComputerDisplayZip(
    val scrambleSheetsWithCode: Map<String, Pair<ScrambleSheet, String>>,
    val competitionTitle: String
) {
    /**
     * Computer display zip
     *
     * This .zip file is nested in the main .zip. It is intentionally not
     * protected with a password, since it's just an easy way to distribute
     * a collection of files that are each are encrypted using their own passcode.
     */
    fun assemble(): ZipArchive {
        return zipArchive {
            for ((uniqueTitle, scrambleDocWithCode) in scrambleSheetsWithCode) {
                val (scrambleDoc, passcode) = scrambleDocWithCode
                val pdfBytes = scrambleDoc.render(passcode)

                file("$uniqueTitle.pdf", pdfBytes)
            }
        }
    }
}
