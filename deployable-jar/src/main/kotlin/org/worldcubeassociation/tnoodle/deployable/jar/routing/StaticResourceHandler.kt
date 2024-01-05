package org.worldcubeassociation.tnoodle.deployable.jar.routing

import io.ktor.server.http.content.*
import io.ktor.server.routing.*
import org.worldcubeassociation.tnoodle.server.RouteHandler

object StaticResourceHandler : RouteHandler {
    override fun install(router: Route) {
        router.staticResources("css", "css")

        router.singlePageApplication {
            react("ui")

            useResources = true
            applicationRoute = "scramble"
        }
    }
}
