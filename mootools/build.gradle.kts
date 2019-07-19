import configurations.Languages.attachRemoteRepositories
import configurations.Languages.configureJava
import configurations.Server.configureWinstonePlugin

description = "mootools js library"

attachRemoteRepositories()

plugins {
    `java-base`
}

configureJava()
configureWinstonePlugin()
