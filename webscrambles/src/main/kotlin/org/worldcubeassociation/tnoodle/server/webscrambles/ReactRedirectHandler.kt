package org.worldcubeassociation.tnoodle.server.webscrambles

import io.ktor.application.call
import io.ktor.response.respondRedirect
import io.ktor.routing.Routing
import io.ktor.routing.get
import org.worldcubeassociation.tnoodle.server.RouteHandler

object ReactRedirectHandler : RouteHandler {
    override fun install(router: Routing) {
        router.get("/") {
            call.respondRedirect("/scramble", true)
        }

        router.get("/favicon.ico") {
            call.respondRedirect("/wca/favicon.ico", true)
        }

        router.get("/scramble/static") {
            call.respondRedirect("/wca/new-ui/static")
        }

        router.get("/scramble/notDot") {
            call.respondRedirect("/wca/new-ui/index.html")
        }

        router.get("/scramble-legacy") {
            call.respondRedirect("/wca/scramblegen.html", true)
        }

        router.get("/readme") {
            call.respondRedirect("/wca/tnoodle-readme.md", true)
        }

        router.get("/readme.md") {
            call.respondRedirect("/wca/tnoodle-readme.md", true)
        }
    }
}
