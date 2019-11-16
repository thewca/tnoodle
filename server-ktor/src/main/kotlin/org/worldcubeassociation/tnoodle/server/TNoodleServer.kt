package org.worldcubeassociation.tnoodle.server

import io.ktor.application.install
import io.ktor.features.ContentNegotiation
import io.ktor.features.DefaultHeaders
import io.ktor.gson.gson
import io.ktor.routing.routing
import io.ktor.server.engine.ShutDownUrl
import org.worldcubeassociation.tnoodle.server.routing.JsEnvHandler
import org.worldcubeassociation.tnoodle.server.routing.StylesheetHandler
import org.worldcubeassociation.tnoodle.server.routing.VersionHandler
import org.worldcubeassociation.tnoodle.server.util.GsonUtil.configureLoaded
import org.worldcubeassociation.tnoodle.server.util.ServerCacheConfig

class TNoodleServer(val cacheConfig: ServerCacheConfig) : ApplicationHandler {
    override fun spinUp(app: io.ktor.application.Application) {
        cacheConfig.createLocalPruningCache()

        app.routing {
            JsEnvHandler.install(this)
            StylesheetHandler.install(this)
            VersionHandler.install(this)
        }

        app.install(ShutDownUrl.ApplicationCallFeature) {
            shutDownUrl = "/kill/now"
            exitCodeSupplier = { 0 }
        }

        app.install(DefaultHeaders) {
            header("Access-Control-Allow-Origin", "*")
        }

        app.install(ContentNegotiation) {
            gson {
                configureLoaded()
            }
        }
    }
}
