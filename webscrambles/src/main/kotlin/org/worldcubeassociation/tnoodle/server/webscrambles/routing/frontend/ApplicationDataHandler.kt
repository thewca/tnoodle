package org.worldcubeassociation.tnoodle.server.webscrambles.routing.frontend

import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.routing.Route
import io.ktor.routing.get
import io.ktor.routing.route
import kotlinx.serialization.json.json
import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.plugins.EventPlugins
import org.worldcubeassociation.tnoodle.server.plugins.FormatPlugins

object ApplicationDataHandler : RouteHandler {
    override fun install(router: Route) {
        router.route("data") {
            get("events") {
                val eventData = EventPlugins.values().map {
                    json {
                        "id" to it.key
                        "name" to it.description
                        "format_ids" to it.legalFormats.map(FormatPlugins::key)
                        "can_change_time_limit" to (it !in EventPlugins.ONE_HOUR_EVENTS)
                        "is_timed_event" to (it !in EventPlugins.ONE_HOUR_EVENTS)
                        "is_fewest_moves" to (it == EventPlugins.THREE_FM)
                        "is_multiple_blindfolded" to (it == EventPlugins.THREE_MULTI_BLD)
                    }
                }

                call.respond(eventData)
            }

            get("formats") {
                val formatData = FormatPlugins.WCA_FORMATS.mapValues {
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
