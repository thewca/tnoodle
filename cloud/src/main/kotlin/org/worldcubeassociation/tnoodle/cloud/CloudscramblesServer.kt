package org.worldcubeassociation.tnoodle.cloud

import io.ktor.server.application.*
import io.ktor.server.routing.*
import org.worldcubeassociation.tnoodle.core.ApplicationHandler
import org.worldcubeassociation.tnoodle.core.TNoodleServer
import org.worldcubeassociation.tnoodle.cloud.routing.HomepageHandler
import org.worldcubeassociation.tnoodle.cloud.routing.PuzzleListHandler
import org.worldcubeassociation.tnoodle.cloud.routing.ScrambleHandler
import org.worldcubeassociation.tnoodle.cloud.routing.ScrambleViewHandler
import org.worldcubeassociation.tnoodle.core.ServerEnvironmentConfig

object CloudscramblesServer : ApplicationHandler {
    override fun spinUp(app: Application) {
        val cloudscramblesWrapper = TNoodleServer(GoogleServerEnvironmentConfig)

        app.routing {
            HomepageHandler.install(this)

            route("api") {
                route("v0") {
                    ScrambleHandler.install(this)
                    ScrambleViewHandler.install(this)
                    PuzzleListHandler.install(this)
                }
            }
        }

        GoogleServerEnvironmentConfig.overrideFontConfig()

        cloudscramblesWrapper.spinUp(app)
    }
}

