import configurations.Languages.attachRepositories
import configurations.Languages.configureJava
import configurations.Server.configureWinstonePlugin

description = "mootools js library"

attachRepositories()

plugins {
    `java-base`
}

configureJava()
configureWinstonePlugin()
