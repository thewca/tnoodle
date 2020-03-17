package org.worldcubeassociation.tnoodle.server

import io.ktor.routing.Route

interface RouteHandler {
    fun install(router: Route)
}
