package org.worldcubeassociation.tnoodle.server.webscrambles.server

import org.worldcubeassociation.tnoodle.server.util.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.util.WebServerUtils
import org.worldcubeassociation.tnoodle.server.util.WebServerUtils.DEVEL_VERSION
import org.worldcubeassociation.tnoodle.server.util.WebServerUtils.PRUNING_FOLDER
import org.worldcubeassociation.tnoodle.server.util.WebServerUtils.jarFile
import org.worldcubeassociation.tnoodle.server.util.WebServerUtils.programDirectory
import java.io.*

object LocalServerEnvironmentConfig : ServerEnvironmentConfig {
    override val projectName
        get() = LocalServerEnvironmentConfig::class.java.getPackage()?.implementationTitle
            ?: WebServerUtils.callerClass?.simpleName!!

    override val version
        get() = LocalServerEnvironmentConfig::class.java.getPackage()?.implementationVersion
            ?: DEVEL_VERSION
}
