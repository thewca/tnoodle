package org.worldcubeassociation.tnoodle.server.webscrambles.routing.frontend

import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
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
                    val tagsWithNames = PrintingFolder.FMC_LOCALES_BY_TAG
                        .mapValues { it.value.displayName }
                        .toSortedMap()

                    call.respond(tagsWithNames)
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
}
