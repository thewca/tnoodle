package org.worldcubeassociation.tnoodle.server.routing

import io.ktor.application.call
import io.ktor.http.ContentType
import io.ktor.response.respond
import io.ktor.response.respondText
import io.ktor.routing.Routing
import io.ktor.routing.get
import kotlinx.serialization.builtins.MapSerializer
import kotlinx.serialization.builtins.serializer

import org.worldcubeassociation.tnoodle.server.RouteHandler
import org.worldcubeassociation.tnoodle.server.serial.JsonConfig

object JsEnvHandler : RouteHandler {
    override fun install(router: Routing) {
        router.get("/env.js") {
            val serial = MapSerializer(String.serializer(), String.serializer())
            val js = "window.TNOODLE_ENV = ${JsonConfig.SERIALIZER.stringify(serial, JS_ENV)};"
            call.respondText(js, ContentType.Application.JavaScript)
        }

        router.get("/env.json") {
            call.respond(JS_ENV)
        }
    }

    private val JS_ENV = mutableMapOf<String, String>()

    fun putJsEnv(key: String, value: String) {
        JS_ENV[key] = value
    }
}
