package org.worldcubeassociation.tnoodle.server.webscrambles

import io.ktor.application.Application
import org.worldcubeassociation.tnoodle.server.webscrambles.server.LocalServerCacheConfig

object WebscramblesKtorLauncher {
    fun spinUpLocally(app: Application) =
        WebscramblesServer(LocalServerCacheConfig).spinUp(app)
}
