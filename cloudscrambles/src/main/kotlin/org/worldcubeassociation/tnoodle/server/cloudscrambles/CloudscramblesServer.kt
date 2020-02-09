package org.worldcubeassociation.tnoodle.server.cloudscrambles

import io.kotless.dsl.ktor.Kotless
import io.ktor.application.Application
import org.worldcubeassociation.tnoodle.server.ApplicationHandler
import org.worldcubeassociation.tnoodle.server.cloudscrambles.CloudscramblesServer.wrapAndLaunchWebscrambes
import org.worldcubeassociation.tnoodle.server.util.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.WebscramblesServer
import org.worldcubeassociation.tnoodle.server.webscrambles.server.LocalServerEnvironmentConfig

object CloudscramblesServer : ApplicationHandler {
    override fun spinUp(app: Application) {
        GoogleServerEnvironmentConfig.overrideFontConfig()
        GoogleServerEnvironmentConfig.wrapAndLaunchWebscrambes(app)
    }

    internal fun ServerEnvironmentConfig.wrapAndLaunchWebscrambes(app: Application) {
        val webscramblesWrapper = WebscramblesServer(this)
        webscramblesWrapper.spinUp(app)
    }
}

class KotlessCloudscramblesServer : Kotless() {
    override fun prepare(app: Application) = LocalServerEnvironmentConfig.wrapAndLaunchWebscrambes(app)
}
