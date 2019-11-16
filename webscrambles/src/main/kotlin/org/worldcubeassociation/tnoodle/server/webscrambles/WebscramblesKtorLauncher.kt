package org.worldcubeassociation.tnoodle.server.webscrambles

import io.ktor.application.Application
import org.worldcubeassociation.tnoodle.server.webscrambles.server.LocalServerEnvironmentConfig

object WebscramblesKtorLauncher {
    fun spinUpLocally(app: Application) =
        WebscramblesServer(LocalServerEnvironmentConfig).spinUp(app)
}
