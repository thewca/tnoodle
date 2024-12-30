package org.worldcubeassociation.tnoodle.server.zip

import org.worldcubeassociation.tnoodle.server.pdf.ScrambleSheet
import org.worldcubeassociation.tnoodle.server.zip.model.ZipArchive
import org.worldcubeassociation.tnoodle.server.zip.model.dsl.zipArchive
import org.worldcubeassociation.tnoodle.server.zip.util.StringUtil.randomPasscode

data class ComputerDisplayZip(
    val scrambleSets: Map<String, ScrambleSheet>,
    val competitionTitle: String
) {
    val passcodes = scrambleSets.mapValues { ActivityPasscode(randomPasscode()) }

    /**
     * Computer display zip
     *
     * This .zip file is nested in the main .zip. It is intentionally not
     * protected with a password, since it's just an easy way to distribute
     * a collection of files that are each are encrypted using their own passcode.
     */
    fun assemble(): ZipArchive {
        return zipArchive {
            for ((uniqueTitle, scrambleDoc) in scrambleSets) {
                val passcode = passcodes.getValue(uniqueTitle)
                passcode.activityCode = scrambleDoc
                passcode.title = uniqueTitle

                val pdfBytes = scrambleDoc.render(passcode.passcode)

                file("$uniqueTitle.pdf", pdfBytes)
            }
        }
    }
}
