package org.worldcubeassociation.tnoodle.server.zip

import org.worldcubeassociation.tnoodle.server.zip.util.StringUtil.toFileSafeString
import org.worldcubeassociation.tnoodle.server.wcif.WCIFDataBuilder
import org.worldcubeassociation.tnoodle.server.wcif.util.MatchedActivity
import org.worldcubeassociation.tnoodle.server.wcif.util.MatchedActivity.Companion.orderedScrambleSheets
import org.worldcubeassociation.tnoodle.server.zip.model.Folder
import org.worldcubeassociation.tnoodle.server.zip.model.dsl.folder

data class OrderedScramblesFolder(val globalTitle: String, val matchedActivities: List<MatchedActivity>) {
    fun assemble(pdfPassword: String?): Folder {
        val matchingFilenames = matchedActivities.groupBy {
            val (folderParts, fileParts) = it.computeFileIdentifier(matchedActivities)

            val filename = listOf(
                "Ordered Scrambles",
                *fileParts.toTypedArray(),
            ).joinToString(" - ", postfix = ".pdf")

            listOf(
                *folderParts.toTypedArray(),
                filename
            ).joinToString("/")
        }

        return folder("Ordered Scrambles") {
            // Generate individual files in sub-folders for the individual locations
            for ((pdfFileName, matchedActivities) in matchingFilenames) {
                val sortedScrambles = matchedActivities.orderedScrambleSheets

                val sheet = WCIFDataBuilder.compileOutlinePdf(sortedScrambles, pdfPassword)
                file(pdfFileName, sheet)
            }

            // Generate all scrambles ordered
            val allScramblesOrdered = matchedActivities.orderedScrambleSheets
            val safeGlobalTitle = globalTitle.toFileSafeString()

            val completeOrderedPdf = WCIFDataBuilder.compileOutlinePdf(allScramblesOrdered, pdfPassword)
            file("$safeGlobalTitle - Ordered Scrambles.pdf", completeOrderedPdf)
        }
    }
}
