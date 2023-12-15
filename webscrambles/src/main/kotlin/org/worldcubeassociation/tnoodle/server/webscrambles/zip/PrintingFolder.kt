package org.worldcubeassociation.tnoodle.server.webscrambles.zip

import org.slf4j.LoggerFactory
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.FewestMovesSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.FmcCutoutSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.FmcSolutionSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.ScrambleSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.Document
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.util.StringUtil.toFileSafeString
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFDataBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Schedule
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.SheetCopyCountExtension
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.Folder
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.dsl.folder
import java.util.*

data class PrintingFolder(
    val competition: Competition,
    val uniqueTitles: Map<String, ScrambleSheet>,
    val fmcTranslations: List<Locale>,
    val watermark: String?
) {
    val scrambleSheetsFlat = uniqueTitles.values.toList()
    val competitionName get() = competition.shortName
    val wcifSchedule get() = competition.schedule

    fun assemble(pdfPassword: String?): Folder {
        val fmcRequests = uniqueTitles.filterValues { it is FewestMovesSheet }

        return folder("Printing") {
            folder("Scramble Sets") {
                for ((uniq, sheet) in uniqueTitles) {
                    file("$uniq.pdf", sheet.render(pdfPassword))
                }
            }

            if (fmcRequests.isNotEmpty()) {
                folder("Fewest Moves - Additional Files") {
                    val defaultGenericPrintingSheet = FmcSolutionSheet.genericBlankSheet(Translate.DEFAULT_LOCALE, competitionName, watermark)
                    file("3x3x3 Fewest Moves Solution Sheet.pdf", defaultGenericPrintingSheet.render())

                    if (fmcTranslations.isNotEmpty()) {
                        folder("Translations") {
                            for (locale in fmcTranslations) {
                                folder(locale.toLanguageTag()) {
                                    val translatedGenericPrintingSheet = FmcSolutionSheet.genericBlankSheet(locale, competitionName, watermark)
                                    file("3x3x3 Fewest Moves Solution Sheet.pdf", translatedGenericPrintingSheet.render())
                                }
                            }
                        }
                    }

                    for ((uniq, sheet) in uniqueTitles) {
                        if (sheet is FewestMovesSheet) {
                            val defaultCutoutSheet = FmcCutoutSheet(sheet.scramble, sheet.totalAttemptsNum, sheet.scrambleSetId, competitionName, sheet.activityCode, sheet.hasGroupId, Translate.DEFAULT_LOCALE, sheet.watermark, sheet.colorScheme)
                            file("$uniq - Scramble Cutout Sheet.pdf", defaultCutoutSheet.render(pdfPassword))

                            if (fmcTranslations.isNotEmpty()) {
                                folder("Translations") {
                                    for (locale in fmcTranslations) {
                                        folder(locale.toLanguageTag()) {
                                            // fewest moves regular sheet
                                            val localPrintingSheet = FmcSolutionSheet(sheet.scramble, sheet.totalAttemptsNum, sheet.scrambleSetId, competitionName, sheet.activityCode, sheet.hasGroupId, locale, sheet.watermark, sheet.colorScheme)
                                            file("$uniq.pdf", localPrintingSheet.render(pdfPassword))

                                            // scramble cutout sheet
                                            val localCutoutSheet = FmcCutoutSheet(sheet.scramble, sheet.totalAttemptsNum, sheet.scrambleSetId, competitionName, sheet.activityCode, sheet.hasGroupId, locale, sheet.watermark, sheet.colorScheme)
                                            file("$uniq Scramble Cutout Sheet.pdf", localCutoutSheet.render(pdfPassword))
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (wcifSchedule.isNotEmpty()) {
                val drawingScrambleSetIds = scrambleSheetsFlat.map { it.scrambleSetId }

                if (wcifSchedule.containsAll(drawingScrambleSetIds)) {
                    val orderedScramblesFolder = OrderedScramblesFolder(competitionName, scrambleSheetsFlat)
                    val orderedScramblesNode = orderedScramblesFolder.assemble(wcifSchedule, pdfPassword)

                    folder(orderedScramblesNode)
                } else {
                    val unmatchedActivities = wcifSchedule.leafActivities
                        .filter { it.activityCode.eventModel != null } // don't want to report that "lunch" or "other" is unmatched
                        .filter { it.scrambleSetId !in drawingScrambleSetIds }

                    LOGGER.warn("Skipping OrderedScrambles because there are unmatched activities: $unmatchedActivities")
                }
            }

            val wcifRounds = competition.events.flatMap { it.rounds }

            val scrambleSheetsWithCopies = scrambleSheetsFlat.flatMap { sheet ->
                val sheetRound = wcifRounds.first { it.idCode.isParentOf(sheet.activityCode) }

                val copyCountExtension = sheetRound.findExtension<SheetCopyCountExtension>()
                val numCopies = copyCountExtension?.numCopies ?: 1

                Document.clone(sheet.document, numCopies)
            }

            val printingCompletePdf = WCIFDataBuilder.compileOutlinePdfBytes(scrambleSheetsWithCopies, pdfPassword)

            val safeGlobalTitle = competitionName.toFileSafeString()
            file("$safeGlobalTitle - All Scrambles.pdf", printingCompletePdf)
        }
    }

    companion object {
        val LOGGER = LoggerFactory.getLogger(PrintingFolder::class.java)

        private fun Schedule.isNotEmpty() = leafActivities.isNotEmpty()

        private fun Schedule.containsAll(scrambleSetIds: Collection<Int>): Boolean {
            val scheduleMatchedIds = allActivities.mapNotNull { it.scrambleSetId }
            return scheduleMatchedIds.containsAll(scrambleSetIds)
        }
    }
}
