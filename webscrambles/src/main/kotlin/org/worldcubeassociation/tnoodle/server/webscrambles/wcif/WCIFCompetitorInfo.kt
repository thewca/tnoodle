package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import org.worldcubeassociation.tnoodle.server.plugins.EventPlugins
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.result.MultiBldResult
import java.util.*

object WCIFCompetitorInfo {
    private val COUNTRY_ISO2_LOCALES = Locale.getAvailableLocales()
        .groupBy { it.country }

    fun detectTranslationLocales(wcif: Competition): Set<Locale> {
        val competitorCountries = wcif.persons
            .map { it.countryIso2 }
            .map { it.isoString }
            .distinct()

        val countryLocales = competitorCountries.flatMap { getTranslatedCountryLanguages(it) }
            .toSet() + Translate.DEFAULT_LOCALE

        return countryLocales.toSet()
    }

    private fun getTranslatedCountryLanguages(iso2: String): List<Locale> {
        val candidateLocales = COUNTRY_ISO2_LOCALES[iso2] ?: return emptyList()

        val translatedLocales = candidateLocales.filter { it in Translate.TRANSLATED_LOCALES }

        val localLanguages = translatedLocales.filter { Locale(it.language, iso2) in Translate.TRANSLATED_LOCALES }
        val generalLanguages = translatedLocales.flatMap { Translate.TRANSLATED_LOCALES.filter { l -> l.language == it.language } }

        return localLanguages.takeIf { it.isNotEmpty() } ?: generalLanguages
    }

    fun <T: Comparable<T>> getBestMultiPB(wcif: Competition, comparator: (MultiBldResult) -> T): MultiBldResult? {
        val mbldResults = wcif.persons
            .flatMap { it.personalBests }
            .filter { it.eventPlugin == EventPlugins.THREE_MULTI_BLD }
            .mapNotNull { it.best.asMultiResult }

        return mbldResults.maxBy { comparator(it) }
    }
}
