package org.worldcubeassociation.tnoodle.core

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.ShutDownUrl
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.defaultheaders.*
import io.ktor.server.routing.*
import org.worldcubeassociation.tnoodle.core.routing.IconHandler
import org.worldcubeassociation.tnoodle.core.routing.JsEnvHandler
import org.worldcubeassociation.tnoodle.core.routing.VersionHandler
import org.worldcubeassociation.tnoodle.core.serial.JsonConfig

class TNoodleServer(val environmentConfig: ServerEnvironmentConfig) : ApplicationHandler {
    override fun spinUp(app: Application) {
        val versionHandler = VersionHandler(environmentConfig)

        app.routing {
            JsEnvHandler.install(this)
            IconHandler.install(this)
            versionHandler.install(this)
        }

        app.install(ShutDownUrl.ApplicationCallPlugin) {
            shutDownUrl = KILL_URL
            exitCodeSupplier = { 0 }
        }

        app.install(DefaultHeaders)

        app.install(CORS) {
            anyHost()
            allowMethod(HttpMethod.Put)
            // gimme dat zesty application/json
            allowNonSimpleContentTypes = true
        }

        app.install(ContentNegotiation) {
            json(json = JsonConfig.SERIALIZER)
        }
    }

    companion object {
        const val KILL_URL = "/kill/tnoodle/now"
    }
}
