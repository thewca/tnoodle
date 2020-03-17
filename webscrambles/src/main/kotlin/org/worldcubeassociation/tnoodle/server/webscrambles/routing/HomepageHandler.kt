package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.application.call
import io.ktor.response.respondRedirect
import io.ktor.routing.Route
import io.ktor.routing.get
import org.worldcubeassociation.tnoodle.server.RouteHandler

object HomepageHandler : RouteHandler {
    override fun install(router: Route) {
        // HOMEPAGE

        router.get {
            call.respondRedirect("/scramble", true)
        }

        // README shortcut

        router.get("about") {
            call.respondRedirect("/readme/scramble")
        }

        router.get("readme") {
            call.respondRedirect("/readme/tnoodle")
        }
    }
}
