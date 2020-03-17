package org.worldcubeassociation.tnoodle.server.cloudscrambles

import io.ktor.application.Application
import io.ktor.routing.routing
import org.worldcubeassociation.tnoodle.server.ApplicationHandler
import org.worldcubeassociation.tnoodle.server.TNoodleServer
import org.worldcubeassociation.tnoodle.server.cloudscrambles.routing.HomepageHandler
import org.worldcubeassociation.tnoodle.server.cloudscrambles.routing.PuzzleListHandler
import org.worldcubeassociation.tnoodle.server.cloudscrambles.routing.ScrambleHandler
import org.worldcubeassociation.tnoodle.server.cloudscrambles.routing.ScrambleViewHandler
import org.worldcubeassociation.tnoodle.server.ServerEnvironmentConfig

object CloudscramblesServer : ApplicationHandler {
    override fun spinUp(app: Application) {
        GoogleServerEnvironmentConfig.overrideFontConfig()
        GoogleServerEnvironmentConfig.wrapAndLaunchServer(app)
    }

    internal fun ServerEnvironmentConfig.wrapAndLaunchServer(app: Application) {
        val webscramblesWrapper = TNoodleServer(this)

        app.routing {
            HomepageHandler.install(this)
            ScrambleHandler.install(this)
            ScrambleViewHandler.install(this)
            PuzzleListHandler.install(this)
        }

        webscramblesWrapper.spinUp(app)
    }
}

