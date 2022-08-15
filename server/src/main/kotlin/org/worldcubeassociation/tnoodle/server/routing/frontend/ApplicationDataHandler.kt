package org.worldcubeassociation.tnoodle.server.routing.frontend

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.worldcubeassociation.tnoodle.core.RouteHandler
import org.worldcubeassociation.tnoodle.core.model.scramble.EventData
import org.worldcubeassociation.tnoodle.core.model.scramble.FormatData
import org.worldcubeassociation.tnoodle.server.serial.EventFrontendData
import org.worldcubeassociation.tnoodle.server.serial.FormatFrontendData

object ApplicationDataHandler : RouteHandler {
    override fun install(router: Route) {
        router.route("data") {
            get("events") {
                val eventData = EventData.values().map(EventFrontendData.Companion::fromDataModel)
                call.respond(eventData)
            }

            get("formats") {
                val formatData = FormatData.WCA_FORMATS.mapValues {
                    FormatFrontendData.fromDataModel(it.value)
                }

                call.respond(formatData)
            }
        }
    }
}
