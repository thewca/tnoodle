package org.worldcubeassociation.tnoodle.server.webscrambles.routing.frontend

import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.routing.Route
import io.ktor.routing.get
import io.ktor.routing.route
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.model.FormatData
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.EventFrontendData
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.FormatFrontendData

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
