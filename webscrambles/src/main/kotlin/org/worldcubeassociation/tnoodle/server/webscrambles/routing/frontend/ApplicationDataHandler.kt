package org.worldcubeassociation.tnoodle.server.webscrambles.routing.frontend

import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.routing.Route
import io.ktor.routing.get
import io.ktor.routing.route
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.json
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.model.FormatData

object ApplicationDataHandler : RouteHandler {
    override fun install(router: Route) {
        router.route("data") {
            get("events") {
                val eventData = EventData.values().map {
                    json {
                        "id" to it.key
                        "name" to it.description
                        "format_ids" to JsonArray(it.legalFormats.map(FormatData::key).map(::JsonPrimitive))
                        "can_change_time_limit" to (it !in EventData.ONE_HOUR_EVENTS)
                        "is_timed_event" to (it !in EventData.ONE_HOUR_EVENTS)
                        "is_fewest_moves" to (it == EventData.THREE_FM)
                        "is_multiple_blindfolded" to (it == EventData.THREE_MULTI_BLD)
                    }
                }

                call.respond(eventData)
            }

            get("formats") {
                val formatData = FormatData.WCA_FORMATS.mapValues {
                    json {
                        "name" to it.value.description
                        "shortName" to it.value.tag
                    }
                }

                call.respond(formatData)
            }
        }
    }
}
