package org.worldcubeassociation.tnoodle.server.routing

import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.routing.Route
import io.ktor.routing.get
import kotlinx.serialization.json.json

import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.cryptography.AsymmetricCipher
import org.worldcubeassociation.tnoodle.server.ServerEnvironmentConfig

class VersionHandler(val version: ServerEnvironmentConfig) : RouteHandler {
    override fun install(router: Route) {
        router.get("version") {
            //FIXME this is a temporary stub implementation until we have actual key pairs
            //val buildVerified = BuildVerification.BUILD_VERIFIED
            val buildVerified = version.projectName == "TNoodle-WCA"

            val json = json {
                "runningVersion" to version.projectTitle
                "officialBuild" to buildVerified
                "keyBytes" to AsymmetricCipher.PUBLIC_KEY_BYTES_BASE64
            }

            call.respond(json)
        }
    }
}
