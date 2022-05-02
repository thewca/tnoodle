package org.worldcubeassociation.tnoodle.server.webscrambles.routing

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
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
