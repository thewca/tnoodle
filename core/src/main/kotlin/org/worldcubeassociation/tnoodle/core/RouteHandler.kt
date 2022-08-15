package org.worldcubeassociation.tnoodle.core

import io.ktor.server.routing.Route

interface RouteHandler {
    fun install(router: Route)
}
