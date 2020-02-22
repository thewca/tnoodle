package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.ApplicationCall
import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.response.respondText
import io.ktor.routing.Routing
import io.ktor.routing.get
import io.ktor.routing.route
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.webscrambles.plugins.PuzzlePlugins

object ScrambleHandler : RouteHandler {
    private suspend fun ApplicationCall.withScrambleSheets(handle: suspend ApplicationCall.(List<String>, Boolean) -> Unit) {
        val puzzle = parameters["puzzleKey"]
            ?: return respondText("No valid puzzle descriptor found")

        val numScrambles = request.queryParameters["numScrambles"]?.toIntOrNull() ?: 5
        val scramblingPuzzle = PuzzlePlugins.WCA_PUZZLES[puzzle]
            ?: return respondText("$puzzle is not a valid TNoodle puzzle!")

        val scrambles = scramblingPuzzle.generateEfficientScrambles(numScrambles)
        val showIndices = "showIndices" in request.queryParameters

        handle(scrambles, showIndices)
    }

    override fun install(router: Routing) {
        router.route("scramble") {
            route("{puzzleKey}") {
                get("txt") {
                    call.withScrambleSheets { scrList, showIndices ->
                        val scrambleLines = scrList.withIndex().joinToString("\r\n") { (i, scr) ->
                            val prefix = "${i + 1}. ".takeIf { showIndices }.orEmpty()

                            prefix + scr.replace("\n", " ")
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
}
