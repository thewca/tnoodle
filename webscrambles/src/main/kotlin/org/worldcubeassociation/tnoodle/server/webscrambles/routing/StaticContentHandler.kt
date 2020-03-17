package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.http.content.defaultResource
import io.ktor.http.content.resource
import io.ktor.http.content.resources
import io.ktor.http.content.static
import io.ktor.routing.Route
import org.worldcubeassociation.tnoodle.server.RouteHandler

object StaticContentHandler : RouteHandler {
    override fun install(router: Route) {
        router.static {
            resource("favicon.ico", "wca/favicon.ico")
            resource("robots.txt", "wca/tnoodle-ui/robots.txt")
        }

        router.static("scramble") {
            resources("wca/tnoodle-ui")
            defaultResource("wca/tnoodle-ui/index.html")

            static("static") {
                resources("wca/tnoodle-ui/static")
            }

            static("oauth") {
                resource("*", "wca/tnoodle-ui/index.html")
            }
        }

        router.static("wca") {
            resources("wca")
        }
    }
}
