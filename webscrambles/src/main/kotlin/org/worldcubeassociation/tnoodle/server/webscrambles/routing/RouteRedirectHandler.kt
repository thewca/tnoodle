package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.call
import io.ktor.response.respondRedirect
import io.ktor.routing.Routing
import io.ktor.routing.get
import org.worldcubeassociation.tnoodle.server.RouteHandler

object RouteRedirectHandler : RouteHandler {
    override fun install(router: Routing) {
        // HOMEPAGE

        router.get("/") {
            call.respondRedirect("/scramble", true)
        }

        // README shortcuts

        router.get("/about") {
            call.respondRedirect("/readme/scrambles")
        }

        router.get("/readme") {
            call.respondRedirect("/readme/tnoodle", true)
        }

        router.get("/readme.md") {
            call.respondRedirect("/readme/tnoodle", true)
        }
    }
}
