package org.worldcubeassociation.tnoodle.server.routing

import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.routing.Routing
import io.ktor.routing.get

import java.io.IOException
import java.net.URL

import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.serial.ScramblingProgramInfo
import org.worldcubeassociation.tnoodle.server.util.WebServerUtils

class VersionHandler(val versionKey: String) : RouteHandler {
    override fun install(router: Routing) {
        router.get("/version.json") {
            try {
                val raw = URL(BASE_URL).readText()
                val json = JsonConfig.SERIALIZER.parse(ScramblingProgramInfo.serializer(), raw)

                val tnoodleJson = json.copy(running_version = versionKey)

                call.respond(tnoodleJson)
            } catch (e: IOException) {
                val json = mapOf(
                    "ignorableError" to WebServerUtils.throwableToString(e)
                )

                call.respond(json)
            }
        }
    }

    companion object {
        const val API_VERSION = "0"
        const val BASE_URL = "https://www.worldcubeassociation.org/api/v$API_VERSION/scramble-program"
    }
}
