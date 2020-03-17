package org.worldcubeassociation.tnoodle.server.cloudscrambles.routing

import io.ktor.application.call
import io.ktor.response.respondRedirect
import io.ktor.response.respondText
import io.ktor.routing.Routing
import io.ktor.routing.get
import org.worldcubeassociation.tnoodle.server.RouteHandler

object HomepageHandler : RouteHandler {
    override fun install(router: Routing) {
        // HOMEPAGE

        router.get("/") {
            call.respondText("Hello, friend!")
        }
    }
}
