package org.worldcubeassociation.tnoodle.server

import org.worldcubeassociation.tnoodle.server.util.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.util.WebServerUtils
import org.worldcubeassociation.tnoodle.server.util.WebServerUtils.DEVEL_VERSION

object LocalServerEnvironmentConfig : ServerEnvironmentConfig {
    override val projectName
        get() = this::class.java.getPackage()?.implementationTitle
            ?: WebServerUtils.callerClass?.simpleName!!

    override val version
        get() = this::class.java.getPackage()?.implementationVersion
            ?: DEVEL_VERSION
}
