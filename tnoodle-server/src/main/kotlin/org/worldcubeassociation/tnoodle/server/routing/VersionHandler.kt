package org.worldcubeassociation.tnoodle.server.routing

import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.routing.Route
import io.ktor.routing.get
import kotlinx.serialization.json.json

import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.crypto.AsymmetricCipher
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
