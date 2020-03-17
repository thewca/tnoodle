package org.worldcubeassociation.tnoodle.server.routing

import io.ktor.http.content.resources
import io.ktor.http.content.static
import io.ktor.routing.Routing
import org.worldcubeassociation.tnoodle.server.RouteHandler

object StylesheetHandler : RouteHandler {
    override fun install(router: Routing) {
        router.static("/css") {
            resources("css")
        }
    }
}
