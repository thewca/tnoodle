package org.worldcubeassociation.tnoodle.server.webscrambles.routing.frontend

import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.svglite.Color

object PuzzleDrawingHandler : RouteHandler {
    override fun install(router: Route) {
        router.route("puzzle") {
            route("{eventId}") {
                get("colors") {
                    val eventId = call.parameters["eventId"]

                    val event = EventData.WCA_EVENTS[eventId]
                        ?: return@get call.respond(HttpStatusCode.NotFound)

                    val defaultColorScheme = event.scrambler.scrambler.defaultColorScheme.mapValues { "#${it.value.toHex()}" }

                    call.respond(defaultColorScheme)
                }

                post("svg") {
                    val eventId = call.parameters["eventId"]

                    val event = EventData.WCA_EVENTS[eventId]
                        ?: return@post call.respond(HttpStatusCode.NotFound)

                    val rawColorScheme = call.receive<Map<String, String>>()
                    val colorScheme = rawColorScheme.mapValues { Color(it.value) }

                    val solvedPuzzleSvg = event.scrambler.scrambler.drawScramble(null, HashMap(colorScheme))

                    call.respondText(solvedPuzzleSvg.toString(), ContentType.Image.SVG)
                }
            }
        }
    }
}
