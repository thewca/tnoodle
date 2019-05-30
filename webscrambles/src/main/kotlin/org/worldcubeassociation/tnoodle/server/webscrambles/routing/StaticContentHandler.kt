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
            defaultResource("wca/new-ui/index.html")

            static("/static") {
                resources("wca/new-ui/static")
            }
        }

        router.static("/scramble-legacy") {
            defaultResource("wca/scramblegen.html")
        }

        router.static("/scrambler-interface") {
            static("/js") {
                resources("static/js")
            }

            static("/css") {
                resources("static/css")
            }
        }

        router.static("/mootools") {
            resources("static/mootools")
        }

        router.static("/wca") {
            resource("tnoodle_logo.svg", "wca/tnoodle_logo.svg")
            resource("scrambleserver.js", "wca/scrambleserver.js")
        }
    }
}
