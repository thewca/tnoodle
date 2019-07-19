import configurations.Languages.attachRemoteRepositories
import configurations.Languages.configureJava
import configurations.Server.configureWinstonePlugin

description = "A generic competition scramble generator interface."

attachRemoteRepositories()

plugins {
    `java-base`
}

configureJava()
configureWinstonePlugin()

dependencies {
    "server"(project(":mootools"))
}
