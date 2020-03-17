package org.worldcubeassociation.tnoodle.server

interface ServerEnvironmentConfig {
    val projectName: String
    val version: String

    val projectTitle
        get() = "$projectName-$version"
}
