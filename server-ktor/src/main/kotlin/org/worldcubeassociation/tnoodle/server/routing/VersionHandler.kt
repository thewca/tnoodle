package org.worldcubeassociation.tnoodle.server.routing

import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.routing.Routing
import io.ktor.routing.get
import kotlinx.serialization.json.json

import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.signature.BuildVerification
import org.worldcubeassociation.tnoodle.server.util.ServerEnvironmentConfig

import java.util.*

class VersionHandler(val version: ServerEnvironmentConfig) : RouteHandler {
    override fun install(router: Routing) {
        router.get("version") {
            val keyBytes = BuildVerification.PUBLIC_KEY_BYTES?.let {
                Base64.getEncoder().encodeToString(it)
            }

            //FIXME this is a temporary stub implementation until we have actual key pairs
            //val buildVerified = BuildVerification.BUILD_VERIFIED
            val buildVerified = version.projectName == "TNoodle-WCA"

            val json = json {
                "runningVersion" to version.projectTitle
                "officialBuild" to buildVerified
                "keyBytes" to keyBytes
            }

            call.respond(json)
        }
    }
}
