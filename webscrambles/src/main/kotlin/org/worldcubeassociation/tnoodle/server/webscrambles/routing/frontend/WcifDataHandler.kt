package org.worldcubeassociation.tnoodle.server.webscrambles.routing.frontend

import io.ktor.application.call
import io.ktor.request.receive
import io.ktor.response.respond
import io.ktor.routing.*
import kotlinx.serialization.json.JsonNull
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.plugins.EventPlugins
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.folder.PrintingFolder
import java.util.*

object WcifDataHandler : RouteHandler {
    override fun install(router: Route) {
        router.route("fmc") {
            route("languages") {
                post("competitors") {
                    val wcif = call.receive<Competition>()

                    val competitorCountries = wcif.persons
                        .map { it.countryIso2 }
                        .map { it.isoString }
                        .distinct()

                    val countryLocales = competitorCountries.flatMap { getTranslatedCountryLanguages(it) }
                        .toSet() + Translate.DEFAULT_LOCALE

                    val detectedLocales = countryLocales.distinct().map { it.toLanguageTag() }
                    call.respond(detectedLocales)
                }

                get("available") {
                    call.respond(AVAILABLE_LANGUAGE_TAGS)
                }
            }
        }

        router.route("mbld") {
            post("best") {
                val wcif = call.receive<Competition>()

                val mbldResults = wcif.persons
                    .flatMap { it.personalBests }
                    .filter { it.eventPlugin == EventPlugins.THREE_MULTI_BLD }
                    .mapNotNull { it.best.asMultiResult }

                val bestMbldAttempt = mbldResults.maxBy { it.attempted } ?: JsonNull
                call.respond(bestMbldAttempt)
            }
        }
    }

    private val COUNTRY_ISO2_LOCALES = Locale.getAvailableLocales()
        .groupBy { it.country }

    private val AVAILABLE_LANGUAGE_TAGS
        get() = PrintingFolder.FMC_LOCALE_AVAILABLE_TAGS.toSortedSet()

    private fun getTranslatedCountryLanguages(iso2: String): List<Locale> {
        val candidateLocales = COUNTRY_ISO2_LOCALES[iso2] ?: return emptyList()

        val translatedLocales = candidateLocales.filter { it in Translate.TRANSLATED_LOCALES }

        val localLanguages = translatedLocales.filter { Locale(it.language, iso2) in Translate.TRANSLATED_LOCALES }
        val generalLanguages = translatedLocales.flatMap { Translate.TRANSLATED_LOCALES.filter { l -> l.language == it.language } }

        return localLanguages.takeIf { it.isNotEmpty() } ?: generalLanguages
    }
}
