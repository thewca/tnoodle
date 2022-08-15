package org.worldcubeassociation.tnoodle.server.routing.statics

import io.ktor.server.http.content.*
import io.ktor.server.routing.*
import org.worldcubeassociation.tnoodle.core.RouteHandler

object StaticResourceHandler : RouteHandler {
    override fun install(router: Route) {
        router.static {
            resource("robots.txt", "wca/tnoodle-ui/robots.txt")
        }

        router.static("css") {
            resources("css")
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
