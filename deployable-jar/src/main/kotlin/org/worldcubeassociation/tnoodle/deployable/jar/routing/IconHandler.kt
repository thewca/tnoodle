package org.worldcubeassociation.tnoodle.deployable.jar.routing

import io.ktor.server.http.content.*
import io.ktor.server.routing.Route
import org.worldcubeassociation.tnoodle.server.RouteHandler

object IconHandler : RouteHandler {
    override fun install(router: Route) {
        router.staticResources("favicon.ico", "icons")
    }
}
