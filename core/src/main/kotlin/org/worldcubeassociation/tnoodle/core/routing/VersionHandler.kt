package org.worldcubeassociation.tnoodle.core.routing

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

import org.worldcubeassociation.tnoodle.core.RouteHandler
import org.worldcubeassociation.tnoodle.core.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.core.serial.VersionInfo

class VersionHandler(version: ServerEnvironmentConfig) : RouteHandler {
    private val serialVersionInfo = VersionInfo.fromEnvironmentConfig(version)

    override fun install(router: Route) {
        router.get("version") {
            call.respond(serialVersionInfo)
        }
    }
}
