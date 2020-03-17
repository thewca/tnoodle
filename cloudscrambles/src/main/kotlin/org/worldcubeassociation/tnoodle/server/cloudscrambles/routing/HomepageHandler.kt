package org.worldcubeassociation.tnoodle.server.cloudscrambles.routing

import io.ktor.application.call
import io.ktor.response.respondText
import io.ktor.routing.Route
import io.ktor.routing.get
import org.worldcubeassociation.tnoodle.server.RouteHandler

object HomepageHandler : RouteHandler {
    override fun install(router: Route) {
        // HOMEPAGE

        router.get("/") {
            call.respondText("Hello, friend!")
        }
    }
}
