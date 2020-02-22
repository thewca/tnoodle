package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.http.content.defaultResource
import io.ktor.http.content.resource
import io.ktor.http.content.resources
import io.ktor.http.content.static
import io.ktor.routing.Routing
import org.worldcubeassociation.tnoodle.server.RouteHandler

object StaticContentHandler : RouteHandler {
    override fun install(router: Routing) {
        router.static("/") {
            resource("favicon.ico", "wca/favicon.ico")
        }

        router.static("/scramble") {
            defaultResource("wca/tnoodle-ui/index.html")

            static("/static") {
                resources("wca/tnoodle-ui/static")
            }

            static("oauth") {
                resource("*", "wca/tnoodle-ui/index.html")
            }
        }

        router.static("/wca") {
            resources("wca")
        }
    }
}
