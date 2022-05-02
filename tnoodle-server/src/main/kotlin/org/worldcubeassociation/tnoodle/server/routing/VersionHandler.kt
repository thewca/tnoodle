package org.worldcubeassociation.tnoodle.server.routing

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.serial.VersionInfo

class VersionHandler(val version: ServerEnvironmentConfig) : RouteHandler {
    private val serialVersionInfo = VersionInfo.fromEnvironmentConfig(version)

    override fun install(router: Route) {
        router.get("version") {
            call.respond(serialVersionInfo)
        }
    }
}
