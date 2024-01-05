package org.worldcubeassociation.tnoodle.server

import io.ktor.server.routing.Route

interface RouteHandler {
    fun install(router: Route)
}
