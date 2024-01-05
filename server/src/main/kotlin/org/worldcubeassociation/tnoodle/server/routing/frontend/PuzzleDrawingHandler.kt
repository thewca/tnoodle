package org.worldcubeassociation.tnoodle.server.routing.frontend

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.model.PuzzleData
import org.worldcubeassociation.tnoodle.server.serial.frontend.FrontendScrambleAndImage
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

                    val colorScheme = call.receiveColorScheme()

                    val randomScramble = puzzle.generateScramble()
                    val scrambledPuzzleSvg = puzzle.scramblerWithCache.drawScramble(randomScramble, colorScheme)

                    val frontendData = FrontendScrambleAndImage(randomScramble, scrambledPuzzleSvg.toString())

                    call.respond(frontendData)
                }

                post("svg") {
                    val puzzle = call.puzzleData
                        ?: return@post call.respond(HttpStatusCode.NotFound)

                    val colorScheme = call.receiveColorScheme()
                    val solvedPuzzleSvg = puzzle.scramblerWithCache.drawScramble(null, colorScheme)

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

    private suspend fun ApplicationCall.receiveColorScheme(): HashMap<String, Color> {
        val rawColorScheme = receive<Map<String, String>>()
        val colorScheme = rawColorScheme.mapValues { Color(it.value) }

        return HashMap(colorScheme)
    }
}
