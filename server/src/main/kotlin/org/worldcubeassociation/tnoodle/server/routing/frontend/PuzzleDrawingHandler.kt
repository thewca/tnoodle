package org.worldcubeassociation.tnoodle.server.routing.frontend

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.model.PuzzleData
import org.worldcubeassociation.tnoodle.svglite.Color

object PuzzleDrawingHandler : RouteHandler {
    override fun install(router: Route) {
        router.route("puzzle") {
            route("{puzzleId}") {
                get("colors") {
                    val puzzle = call.puzzleData
                        ?: return@get call.respond(HttpStatusCode.NotFound)

                    val defaultColorScheme =
                        puzzle.scrambler.defaultColorScheme.mapValues { "#${it.value.toHex()}" }

                    call.respond(defaultColorScheme)
                }

                post("scramble") {
                    val puzzle = call.puzzleData
                        ?: return@post call.respond(HttpStatusCode.NotFound)

                    val randomScramble = puzzle.generateScramble()
                    call.respond(randomScramble)
                }

                post("svg") {
                    val puzzle = call.puzzleData
                        ?: return@post call.respond(HttpStatusCode.NotFound)

                    val rawColorScheme = call.receive<Map<String, String>?>().orEmpty()
                    val modelColorScheme = rawColorScheme.mapValues { Color(it.value) }

                    val requestScramble = call.queryParameters["scramble"]

                    val solvedPuzzleSvg = puzzle.scramblerWithCache.drawScramble(requestScramble, modelColorScheme.toMutableMap())

                    call.respondText(solvedPuzzleSvg.toString(), ContentType.Image.SVG)
                }
            }
        }
    }

    private val ApplicationCall.puzzleData
        get(): PuzzleData? {
            val puzzleId = parameters["puzzleId"]

            return PuzzleData.WCA_PUZZLES[puzzleId]
        }
}
