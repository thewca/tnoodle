package org.worldcubeassociation.tnoodle.server.routing

import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.routing.Routing
import io.ktor.routing.get
import kotlinx.serialization.json.json

import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.signature.BuildVerification

import java.util.*

class VersionHandler(val versionKey: String) : RouteHandler {
    override fun install(router: Routing) {
        router.get("/version") {
            val keyBytes = BuildVerification.PUBLIC_KEY_BYTES?.let {
                Base64.getEncoder().encode(it)
            }

            val json = json {
                "runningVersion" to versionKey
                "officialBuild" to BuildVerification.BUILD_VERIFIED
                "keyBytes" to keyBytes
            }

            call.respond(json)
        }
    }
}
