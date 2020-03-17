package org.worldcubeassociation.tnoodle.server.webscrambles.routing.frontend

import io.ktor.application.call
import io.ktor.request.receive
import io.ktor.response.respond
import io.ktor.routing.*
import kotlinx.serialization.json.JsonNull
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFCompetitorInfo
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.folder.PrintingFolder

object WcifDataHandler : RouteHandler {
    override fun install(router: Route) {
        router.route("fmc") {
            route("languages") {
                post("competitors") {
                    val wcif = call.receive<Competition>()

                    val detectedLocales = WCIFCompetitorInfo.detectTranslationLocales(wcif)
                    val localeStrings = detectedLocales.map { it.toLanguageTag() }.sorted()

                    call.respond(localeStrings)
                }

                get("available") {
                    call.respond(AVAILABLE_LANGUAGE_TAGS)
                }
            }
        }

        router.route("mbld") {
            post("best") {
                val wcif = call.receive<Competition>()

                val bestMbldAttempt = WCIFCompetitorInfo.getBestMultiPB(wcif) { it.attempted }

                // ktor is not able to seralise null implicitly, only explicitly :/
                val serialAttempt = bestMbldAttempt ?: JsonNull
                call.respond(serialAttempt)
            }
        }
    }

    private val AVAILABLE_LANGUAGE_TAGS
        get() = PrintingFolder.FMC_LOCALE_AVAILABLE_TAGS.toSortedSet()
}
