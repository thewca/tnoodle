package org.worldcubeassociation.tnoodle.deployable.gce

import io.ktor.server.application.*
import io.ktor.server.routing.*
import org.worldcubeassociation.tnoodle.server.ApplicationHandler
import org.worldcubeassociation.tnoodle.server.TNoodleServer
import org.worldcubeassociation.tnoodle.deployable.gce.routing.HomepageHandler
import org.worldcubeassociation.tnoodle.server.ServerEnvironmentConfig

object CloudscramblesServer : ApplicationHandler {
    override fun spinUp(app: Application) {
        GoogleServerEnvironmentConfig.overrideFontConfig()
        GoogleServerEnvironmentConfig.wrapAndLaunchServer(app)
    }

    internal fun ServerEnvironmentConfig.wrapAndLaunchServer(app: Application) {
        val serverWrapper = TNoodleServer(this)

        app.routing {
            HomepageHandler.install(this)
        }

        serverWrapper.spinUp(app)
    }
}

