package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.call
import io.ktor.request.receive
import io.ktor.response.respond
import io.ktor.routing.Routing
import io.ktor.routing.post
import io.ktor.routing.route
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import java.util.*

object WcifDataHandler : RouteHandler {
    override fun install(router: Routing) {
        router.route("wcif/data") {
            post("fmc-competitor-languages") {
                val wcif = call.receive<Competition>()

                val competitorCountries = wcif.persons
                    .map { it.countryIso2 }
                    .map { it.isoString }
                    .distinct()

                val countryLocales = competitorCountries.flatMap { getTranslatedCountryLanguage(it) }
                    .toSet() + Translate.DEFAULT_LOCALE

                val detectedLocales = countryLocales.distinct().map { it.toLanguageTag() }
                call.respond(detectedLocales)
            }
        }
    }

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
