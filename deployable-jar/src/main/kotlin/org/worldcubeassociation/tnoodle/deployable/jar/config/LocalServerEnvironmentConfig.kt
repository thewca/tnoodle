package org.worldcubeassociation.tnoodle.deployable.jar.config

import org.worldcubeassociation.tnoodle.server.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.deployable.jar.server.WebServerUtils.DEVEL_VERSION
import org.worldcubeassociation.tnoodle.deployable.jar.server.WebServerUtils

object LocalServerEnvironmentConfig : ServerEnvironmentConfig {
    override val projectName
        get() = this::class.java.getPackage()?.implementationTitle
            ?: WebServerUtils.callerClass?.simpleName!!

    override val projectVersion
        get() = this::class.java.getPackage()?.implementationVersion
            ?: DEVEL_VERSION
}
