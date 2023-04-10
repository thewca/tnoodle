package org.worldcubeassociation.tnoodle.server.webscrambles.routing.frontend

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.FrontendScrambleAndImage
import org.worldcubeassociation.tnoodle.svglite.Color

object PuzzleDrawingHandler : RouteHandler {
    override fun install(router: Route) {
        router.route("puzzle") {
            route("{eventId}") {
                get("colors") {
                    val eventId = call.parameters["eventId"]

                    val event = EventData.WCA_EVENTS[eventId]
                        ?: return@get call.respond(HttpStatusCode.NotFound)

                    val defaultColorScheme =
                        event.scrambler.scrambler.defaultColorScheme.mapValues { "#${it.value.toHex()}" }

                    call.respond(defaultColorScheme)
                }

                post("scramble") {
                    val event = call.eventData
                        ?: return@post call.respond(HttpStatusCode.NotFound)

                    val colorScheme = call.receiveColorScheme()

                    val randomScramble = event.scrambler.generateScramble()
                    val scrambledPuzzleSvg = event.scrambler.scramblerWithCache.drawScramble(randomScramble, colorScheme)

                    val frontendData = FrontendScrambleAndImage(randomScramble, scrambledPuzzleSvg.toString())

                    call.respond(frontendData)
                }

                post("svg") {
                    val event = call.eventData
                        ?: return@post call.respond(HttpStatusCode.NotFound)

                    val colorScheme = call.receiveColorScheme()
                    val solvedPuzzleSvg = event.scrambler.scramblerWithCache.drawScramble(null, colorScheme)

                    call.respondText(solvedPuzzleSvg.toString(), ContentType.Image.SVG)
                }
            }
        }
    }

    private val ApplicationCall.eventData
        get(): EventData? {
            val eventId = parameters["eventId"]

            return EventData.WCA_EVENTS[eventId]
        }

    private suspend fun ApplicationCall.receiveColorScheme(): HashMap<String, Color> {
        val rawColorScheme = receive<Map<String, String>>()
        val colorScheme = rawColorScheme.mapValues { Color(it.value) }

        return HashMap(colorScheme)
    }
}
