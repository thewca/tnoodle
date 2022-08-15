package org.worldcubeassociation.tnoodle.server

import org.worldcubeassociation.tnoodle.core.ServerEnvironmentConfig
import org.worldcubeassociation.tnoodle.server.util.JvmUtil

data class LocalServerEnvironmentConfig(val port: Int = TNOODLE_PORT) : ServerEnvironmentConfig {
    val url get() = "http://localhost:$port"

    override val projectName = this::class.java.getPackage()?.implementationTitle
            ?: JvmUtil.callerClass?.simpleName!!

    override val projectVersion = this::class.java.getPackage()?.implementationVersion
            ?: ServerEnvironmentConfig.DEVEL_VERSION

    companion object {
        const val TNOODLE_DEFAULT_PORT = 2014
        const val TNOODLE_PORT_ENV_KEY = "TNOODLE_PORT"

        val TNOODLE_PORT = System.getenv(TNOODLE_PORT_ENV_KEY)?.toIntOrNull()
            ?: TNOODLE_DEFAULT_PORT
    }
}
