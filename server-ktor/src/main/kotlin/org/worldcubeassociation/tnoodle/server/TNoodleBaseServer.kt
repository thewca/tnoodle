package org.worldcubeassociation.tnoodle.server

import io.ktor.application.Application
import io.ktor.application.install
import io.ktor.features.DefaultHeaders
import io.ktor.routing.routing
import io.ktor.server.engine.ShutDownUrl
import org.worldcubeassociation.tnoodle.server.routing.JsEnvHandler
import org.worldcubeassociation.tnoodle.server.routing.MarkdownHandler
import org.worldcubeassociation.tnoodle.server.routing.VersionHandler

fun Application.tnoodleBase() {
    routing {
        JsEnvHandler.install(this)
        MarkdownHandler.install(this)
        VersionHandler.install(this)
    }

    install(ShutDownUrl.ApplicationCallFeature) {
        shutDownUrl = "/kill/now"
        exitCodeSupplier = { 0 }
    }

    install(DefaultHeaders) {
        header("Access-Control-Allow-Origin", "*")
    }
}
