package org.worldcubeassociation.tnoodle.server.webscrambles.zip.folder

import org.worldcubeassociation.tnoodle.server.webscrambles.plugins.EventPlugins
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.FmcGenericSolutionSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.FmcScrambleCutoutSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.FmcSolutionSheet
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.StringUtil.toFileSafeString
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.CompetitionDrawingData
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.ScrambleDrawingData
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFDataBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFDataBuilder.getCachedPdf
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.ActivityCode
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Schedule
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.ScrambleSet
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.FmcLanguagesExtension
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.folder
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.Folder
import java.time.LocalDate
import java.util.*

data class PrintingFolder(val uniqueTitles: Map<String, ScrambleDrawingData>, val globalTitle: String, val wcif: Competition) {
    val scrambleSheetsFlat = uniqueTitles.values.toList()
    val scrambleDrawingData = CompetitionDrawingData(globalTitle, scrambleSheetsFlat)

    fun assemble(generationDate: LocalDate, versionTag: String, password: String?): Folder {
        val fmcRequests = uniqueTitles.filterValues { it.isFmc }

        val pseudoActivityCode = ActivityCode.compile(EventPlugins.THREE_FM, round = 1)
        val genericSolutionSheetPdf = FmcGenericSolutionSheet(ScrambleSet.empty(), pseudoActivityCode, globalTitle, Translate.DEFAULT_LOCALE)
        val printingCompletePdf = WCIFDataBuilder.requestsToCompletePdf(scrambleDrawingData, generationDate, versionTag)

        return folder("Printing") {
            folder("Scramble Sets") {
                for ((uniq, req) in uniqueTitles) {
                    // Without passcode, for printing
                    val pdfPrintingByteStream = req.getCachedPdf(generationDate, versionTag, globalTitle, Translate.DEFAULT_LOCALE)

                    file("$uniq.pdf", pdfPrintingByteStream.render())
                }
            }

            if (fmcRequests.isNotEmpty()) {
                folder("Fewest Moves - Additional Files") {
                    file("3x3x3 Fewest Moves Solution Sheet.pdf", genericSolutionSheetPdf.render())

                    for ((uniq, req) in fmcRequests) {
                        val cutoutZipName = "$uniq - Scramble Cutout Sheet.pdf"
                        val cutoutSheet = FmcScrambleCutoutSheet(req.scrambleSet, req.activityCode, globalTitle)

                        file(cutoutZipName, cutoutSheet.render(password))

                        folder("Translations") {
                            val requestedTranslations = req.scrambleSet.findExtension<FmcLanguagesExtension>()
                                ?.languageTags?.takeUnless { it.isEmpty() }
                                ?: compileCompetitorLanguages().takeUnless { it.isEmpty() }
                                ?: Translate.TRANSLATED_LOCALES.map { it.toLanguageTag() }

                            for (locale in Translate.TRANSLATED_LOCALES) {
                                if (locale.toLanguageTag() !in requestedTranslations) {
                                    continue
                                }

                                val languageMarkerTitle = "${locale.toLanguageTag()}_$uniq"

                                // fewest moves regular sheet
                                val printingSheet = FmcSolutionSheet(req.scrambleSet, req.activityCode, globalTitle, locale)

                                // Generic sheet.
                                val genericPrintingSheet = FmcGenericSolutionSheet(req.scrambleSet, req.activityCode, globalTitle, locale)

                                file("$languageMarkerTitle.pdf", printingSheet.render(password))
                                file("$languageMarkerTitle Solution Sheet.pdf", genericPrintingSheet.render(password))
                            }
                        }
                    }
                }
            }

            if (wcif.schedule.isNotEmpty()) {
                val orderedScramblesFolder = OrderedScramblesFolder(globalTitle, scrambleDrawingData)
                val orderedScramblesNode = orderedScramblesFolder.assemble(wcif.schedule, generationDate, versionTag)

                folder(orderedScramblesNode)
            }

            val safeGlobalTitle = globalTitle.toFileSafeString()

            // Note that we're not passing the password into this function. It seems pretty silly
            // to put a password protected pdf inside of a password protected zip file.
            file("$safeGlobalTitle - All Scrambles.pdf", printingCompletePdf.render())
        }
    }

    private fun compileCompetitorLanguages(): List<String> {
        val competitorCountries = this.wcif.persons
            .map { it.countryIso2 }
            .map { it.isoString }
            .distinct()

        val countryLocales = competitorCountries.flatMap { getTranslatedCountryLanguage(it) }
            .toSet() + Translate.DEFAULT_LOCALE

        return countryLocales.distinct().map { it.toLanguageTag() }
    }

    companion object {
        private fun Schedule.isNotEmpty() = leafActivities.isNotEmpty()

        private val COUNTRY_ISO2_LOCALES = Locale.getAvailableLocales()
            .groupBy { it.country }

        private val TRANSLATED_LANGUAGE_ISO2 = Translate.TRANSLATED_LOCALES
            .map { it.language }.toSet()

        private fun getTranslatedCountryLanguage(iso2: String): List<Locale> {
            val candidateLocales = COUNTRY_ISO2_LOCALES[iso2] ?: return emptyList()

            val translatedLocales = candidateLocales.filter { it.language in TRANSLATED_LANGUAGE_ISO2 }

            val localLanguages = translatedLocales.filter { Locale(it.language, iso2) in Translate.TRANSLATED_LOCALES }
            val generalLanguages = translatedLocales.flatMap { Translate.TRANSLATED_LOCALES.filter { l -> l.language == it.language } }

            return localLanguages.takeIf { it.isNotEmpty() } ?: generalLanguages
        }
    }
}
