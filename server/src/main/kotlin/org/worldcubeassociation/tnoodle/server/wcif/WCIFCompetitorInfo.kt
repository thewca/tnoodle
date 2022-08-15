package org.worldcubeassociation.tnoodle.server.wcif

import org.worldcubeassociation.tnoodle.core.model.scramble.EventData
import org.worldcubeassociation.tnoodle.server.util.Translate
import org.worldcubeassociation.tnoodle.core.model.wcif.Competition
import org.worldcubeassociation.tnoodle.core.model.wcif.RegistrationStatus
import org.worldcubeassociation.tnoodle.server.serial.MultiBldResult
import org.worldcubeassociation.tnoodle.server.serial.MultiBldResult.Companion.asMultiResult
import java.util.*

object WCIFCompetitorInfo {
    private val COUNTRY_ISO2_LOCALES = Locale.getAvailableLocales()
        .groupBy { it.country }

    private val TRANSLATED_BY_LANGUAGE_TAG = Translate.TRANSLATED_LOCALES
        .groupBy { it.language }

    fun detectTranslationLocales(wcif: Competition): Set<Locale> {
        val competitorCountries = wcif.persons
            .filter { it.registration?.status == RegistrationStatus.ACCEPTED }
            .map { it.countryIso2.isoString }
            .distinct()

        val countryLocales = competitorCountries.flatMap(::getTranslatedCountryLanguages)
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
            .filter { it.registration?.status == RegistrationStatus.ACCEPTED }
            .flatMap { it.personalBests }
            .filter { it.eventModel == EventData.THREE_MULTI_BLD }
            .mapNotNull { it.best.asMultiResult }

        return mbldResults.maxByOrNull(comparator)
    }
}
