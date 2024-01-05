package org.worldcubeassociation.tnoodle.server.webscrambles.config

import org.worldcubeassociation.tnoodle.server.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.server.WebServerUtils.DEVEL_VERSION
import org.worldcubeassociation.tnoodle.server.webscrambles.server.WebServerUtils

object LocalServerEnvironmentConfig : ServerEnvironmentConfig {
    override val projectName
        get() = this::class.java.getPackage()?.implementationTitle
            ?: WebServerUtils.callerClass?.simpleName!!

    override val projectVersion
        get() = this::class.java.getPackage()?.implementationVersion
            ?: DEVEL_VERSION
}
