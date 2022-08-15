package org.worldcubeassociation.tnoodle.core

interface ServerEnvironmentConfig {
    val projectName: String
    val projectVersion: String

    val title
        get() = "$projectName-$projectVersion"

    companion object {
        val DEVEL_VERSION = "devel-TEMP"
    }
}
