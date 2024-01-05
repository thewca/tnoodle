package org.worldcubeassociation.tnoodle.deployable.gce.routing

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.worldcubeassociation.tnoodle.server.RouteHandler

object HomepageHandler : RouteHandler {
    override fun install(router: Route) {
        // HOMEPAGE

        router.get {
            call.respondText("Welcome, friend!")
        }
    }
}
