package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.server.http.content.*
import io.ktor.server.routing.*
import org.worldcubeassociation.tnoodle.server.RouteHandler

object StaticResourceHandler : RouteHandler {
    override fun install(router: Route) {
        router.staticResources("css", "css")

        router.singlePageApplication {
            react("wca/tnoodle-ui")

            useResources = true
            applicationRoute = "scramble"
        }
    }
}
