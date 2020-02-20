package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.ApplicationCall
import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.response.respondText
import io.ktor.routing.Routing
import io.ktor.routing.get
import io.ktor.routing.route
import io.ktor.util.toMap
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.webscrambles.InvalidScrambleRequestException
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest

object ScrambleHandler : RouteHandler {
    private suspend fun ApplicationCall.withScrambleSheets(handle: suspend ApplicationCall.(List<ScrambleRequest>, Boolean) -> Unit) {
        val query = request.queryParameters.toMap()
            .mapValues { it.value.first() }
            .toMutableMap()

        // TODO - this means you can't have a round named "seed" or "showIndices"!
        val seed = query.remove("seed")
        val showIndicesTag = query.remove("showIndices") ?: "0"

        if (query.isEmpty()) {
            throw InvalidScrambleRequestException("Must specify at least one scramble request")
        }

        val scrambleRequests = query.map { (title, reqUrl) ->
            ScrambleRequest.parseScrambleRequest(title, reqUrl, seed)
        }

        val showIndices = showIndicesTag == "1"
        handle(scrambleRequests, showIndices)
    }

    override fun install(router: Routing) {
        router.route("scramble") {
            get("txt") {
                call.withScrambleSheets { reqList, showIndices ->
                    val scrambleLines = reqList.joinToString("\r\n") { req ->
                        val copiedRequests = List(req.copies) { req.scrambles }

                        copiedRequests.withIndex().joinToString("\r\n") { (i, scr) ->
                            val prefix = "${i + 1}. ".takeIf { showIndices }.orEmpty()

                            scr.joinToString("\r\n") {
                                prefix + it.replace("\n", " ")
                            }
                        }
                    }

                    respondText(scrambleLines)
                }
            }
            get("json") {
                call.withScrambleSheets { reqList, _ ->
                    respond(reqList)
                }
            }
        }
    }
}
