package org.worldcubeassociation.tnoodle.server.cloudscrambles.routing

import io.ktor.application.ApplicationCall
import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.response.respondText
import io.ktor.routing.Route
import io.ktor.routing.get
import io.ktor.routing.route
import kotlinx.serialization.json.JsonNull
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.model.PuzzleData

object ScrambleHandler : RouteHandler {
    private const val PUZZLE_KEY_PARAM = PuzzleListHandler.PUZZLE_KEY_PARAM

    private const val QUERY_NUM_SCRAMBLES_PARAM = "numScrambles"
    private const val QUERY_ENUMERATE_PARAM = "enumerate"

    private suspend fun ApplicationCall.withScrambleSheets(handle: suspend ApplicationCall.(List<String>, Boolean) -> Unit) {
        val puzzle = parameters[PUZZLE_KEY_PARAM]
            ?: return respondText("No valid puzzle descriptor found")

        val scramblingPuzzle = PuzzleData.WCA_PUZZLES[puzzle]
            ?: return respondText("$puzzle is not a valid TNoodle puzzle!")

        val numScrambles = request.queryParameters[QUERY_NUM_SCRAMBLES_PARAM]?.toIntOrNull() ?: 1
        val scrambles = scramblingPuzzle.generateEfficientScrambles(numScrambles)

        val enumerate = QUERY_ENUMERATE_PARAM in request.queryParameters

        handle(scrambles, enumerate)
    }

    override fun install(router: Route) {
        router.route("scramble") {
            route("{$PUZZLE_KEY_PARAM}") {
                get("raw") {
                    call.withScrambleSheets { scrList, enumerate ->
                        val scrambleLines = scrList.withIndex().joinToString("\r\n") { (i, scr) ->
                            val prefix = "${i + 1}. ".takeIf { enumerate }.orEmpty()

                            prefix + scr.replace("\n", " ")
                        }

                        respondText(scrambleLines)
                    }
                }

                get {
                    call.withScrambleSheets { reqList, enumerate ->
                        if (enumerate) {
                            respond(reqList)
                        } else {
                            val response = reqList.singleOrNull() ?: JsonNull
                            respond(response)
                        }
                    }
                }
            }
        }
    }
}
