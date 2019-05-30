package org.worldcubeassociation.tnoodle.server.routing

import com.google.gson.reflect.TypeToken
import io.ktor.application.call
import io.ktor.response.respond
import io.ktor.routing.Routing
import io.ktor.routing.get

import java.io.IOException
import java.net.URL
import java.util.HashMap

import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.TNoodleServer
import org.worldcubeassociation.tnoodle.server.util.GsonUtil.GSON
import org.worldcubeassociation.tnoodle.server.util.WebServerUtils

object VersionHandler : RouteHandler {
    override fun install(router: Routing) {
        router.get("/version.json") {
            try {
                val raw = URL(BASE_URL).readText()

                val json: MutableMap<String, Any> = GSON.fromJson(raw, object : TypeToken<HashMap<String, Any>>() {}.type)

                val runningVersionKey = "running_version"
                assert(!json.containsKey(runningVersionKey))

                json[runningVersionKey] = "${TNoodleServer.NAME}-${TNoodleServer.VERSION}"

                call.respond(json)
            } catch (e: IOException) {
                val json = HashMap<String, Any>()
                json["ignorableError"] = WebServerUtils.throwableToString(e)

                call.respond(json)
            }
        }
    }

    const val API_VERSION = "0"
    const val BASE_URL = "https://www.worldcubeassociation.org/api/v$API_VERSION/scramble-program"
}
