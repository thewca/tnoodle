package org.worldcubeassociation.tnoodle.server.routing

import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.routing.Routing
import io.ktor.routing.get
import kotlinx.serialization.internal.StringSerializer
import kotlinx.serialization.json.Json
import kotlinx.serialization.map

import java.io.IOException
import java.net.URL
import java.util.HashMap

import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.util.WebServerUtils

class VersionHandler(val versionKey: String) : RouteHandler {
    override fun install(router: Routing) {
        router.get("/version.json") {
            try {
                val raw = URL(BASE_URL).readText()

                val serial = (StringSerializer to StringSerializer).map
                val json = Json.parse(serial, raw).toMutableMap()

                val runningVersionKey = "running_version"
                assert(!json.containsKey(runningVersionKey))

                json[runningVersionKey] = versionKey

                call.respond(json)
            } catch (e: IOException) {
                val json = HashMap<String, Any>()
                json["ignorableError"] = WebServerUtils.throwableToString(e)

                call.respond(json)
            }
        }
    }

    companion object {
        const val API_VERSION = "0"
        const val BASE_URL = "https://www.worldcubeassociation.org/api/v$API_VERSION/scramble-program"
    }
}
