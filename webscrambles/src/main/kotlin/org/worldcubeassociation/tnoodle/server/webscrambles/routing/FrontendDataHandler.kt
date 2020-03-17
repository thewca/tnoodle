package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.call
import io.ktor.request.receive
import io.ktor.response.respond
import io.ktor.routing.Routing
import io.ktor.routing.get
import io.ktor.routing.post
import io.ktor.routing.route
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.json
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.plugins.EventPlugins
import org.worldcubeassociation.tnoodle.server.webscrambles.plugins.FormatPlugins
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.folder.PrintingFolder
import java.util.*

object FrontendDataHandler : RouteHandler {
    override fun install(router: Routing) {
        router.route("frontend") {
            route("data") {
                get("events") {
                    val eventData = EventPlugins.values().map {
                        json {
                            "id" to it.key
                            "name" to it.description
                            "format_ids" to it.legalFormats.map(FormatPlugins::key)
                            "can_change_time_limit" to (it !in EventPlugins.ONE_HOUR_EVENTS)
                            "is_timed_event" to (it !in EventPlugins.ONE_HOUR_EVENTS)
                            "is_fewest_moves" to (it == EventPlugins.THREE_FM)
                            "is_multiple_blindfolded" to (it == EventPlugins.THREE_MULTI_BLD)
                        }
                    }

                    call.respond(eventData)
                }

                get("formats") {
                    val formatData = FormatPlugins.WCA_FORMATS.mapValues {
                        json {
                            "name" to it.value.description
                            "shortName" to it.value.tag
                        }
                    }

                    call.respond(formatData)
                }
            }

            route("fmc/languages") {
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

            route("mbld") {
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
