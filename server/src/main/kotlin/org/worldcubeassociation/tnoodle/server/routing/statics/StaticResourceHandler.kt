package org.worldcubeassociation.tnoodle.server.routing.statics

import io.ktor.server.http.content.*
import io.ktor.server.routing.*
import org.worldcubeassociation.tnoodle.core.RouteHandler
import org.worldcubeassociation.tnoodle.core.util.FrontendUtil.FRONTEND_BINDING_PACKAGE

object StaticResourceHandler : RouteHandler {
    override fun install(router: Route) {
        router.static {
            resource("robots.txt", "$FRONTEND_BINDING_PACKAGE/robots.txt")
        }

        router.static("css") {
            resources("css")
        }

        router.static("scramble") {
            resources(FRONTEND_BINDING_PACKAGE)
            defaultResource("$FRONTEND_BINDING_PACKAGE/index.html")

            static("static") {
                resources("$FRONTEND_BINDING_PACKAGE/static")
            }

            static("oauth") {
                resource("*", "$FRONTEND_BINDING_PACKAGE/index.html")
            }
        }

        router.static("wca") {
            resources("wca")
        }
    }
}
