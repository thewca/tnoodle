package org.worldcubeassociation.tnoodle.server.routing

import io.ktor.http.content.resource
import io.ktor.http.content.resources
import io.ktor.http.content.static
import io.ktor.routing.Route
import org.worldcubeassociation.tnoodle.server.RouteHandler

object IconHandler : RouteHandler {
    override fun install(router: Route) {
        router.static {
            resource("favicon.ico", "icons/favicon.ico")
        }
    }
}
