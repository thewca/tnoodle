package org.worldcubeassociation.tnoodle.server.cloudscrambles

import io.ktor.application.Application
import org.worldcubeassociation.tnoodle.server.ApplicationHandler
import org.worldcubeassociation.tnoodle.server.webscrambles.WebscramblesServer

object CloudscramblesServer : ApplicationHandler {
    val webscramblesWrapper = WebscramblesServer(GoogleServerCacheConfig)

    override fun spinUp(app: Application) {
        GoogleServerCacheConfig.overrideFontConfig()

        webscramblesWrapper.spinUp(app)
    }
}
