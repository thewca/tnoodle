package org.worldcubeassociation.tnoodle.server

interface ServerEnvironmentConfig {
    val projectName: String
    val projectVersion: String

    val title
        get() = "$projectName-$projectVersion"
}
