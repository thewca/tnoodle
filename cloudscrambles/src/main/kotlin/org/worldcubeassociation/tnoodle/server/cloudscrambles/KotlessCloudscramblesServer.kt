package org.worldcubeassociation.tnoodle.server.cloudscrambles

import io.kotless.dsl.ktor.Kotless
import io.ktor.application.Application
import org.worldcubeassociation.tnoodle.server.config.LocalServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.cloudscrambles.CloudscramblesServer.wrapAndLaunchServer

class KotlessCloudscramblesServer : Kotless() {
    override fun prepare(app: Application) = LocalServerEnvironmentConfig.wrapAndLaunchServer(app)
}
