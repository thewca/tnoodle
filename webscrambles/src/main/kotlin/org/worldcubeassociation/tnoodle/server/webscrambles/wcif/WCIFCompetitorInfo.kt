package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.result.MultiBldResult
import java.util.*

object WCIFCompetitorInfo {
    private val COUNTRY_ISO2_LOCALES = Locale.getAvailableLocales()
        .groupBy { it.country }

    private val TRANSLATED_BY_LANGUAGE_TAG = Translate.TRANSLATED_LOCALES
        .groupBy { it.language }

    fun detectTranslationLocales(wcif: Competition): Set<Locale> {
        val competitorCountries = wcif.persons
            .map { it.countryIso2.isoString }
            .distinct()

        val countryLocales = competitorCountries.flatMap { getTranslatedCountryLanguages(it) }
            .toSet() + Translate.DEFAULT_LOCALE

        return countryLocales.toSet()
    }

    private fun getTranslatedCountryLanguages(iso2: String): List<Locale> {
        val candidateLocales = COUNTRY_ISO2_LOCALES[iso2] ?: return emptyList()

        val languageGroup = candidateLocales.flatMap { TRANSLATED_BY_LANGUAGE_TAG[it.language].orEmpty() }

        val localLanguages = languageGroup.filter { it.country == iso2 }
        val generalLanguages = languageGroup.filter { it.language !in localLanguages.map(Locale::getLanguage) }

        return localLanguages + generalLanguages
    }

    fun <T : Comparable<T>> getBestMultiPB(wcif: Competition, comparator: (MultiBldResult) -> T): MultiBldResult? {
        val mbldResults = wcif.persons
            .flatMap { it.personalBests }
            .filter { it.eventModel == EventData.THREE_MULTI_BLD }
            .mapNotNull { it.best.asMultiResult }

        return mbldResults.maxByOrNull { comparator(it) }
    }
}
