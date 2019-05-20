import configurations.Languages.attachRepositories
import configurations.Languages.configureJava
import configurations.Server.configureWinstonePlugin

description = "A generic competition scramble generator interface."

attachRepositories()

plugins {
    `java-base`
}

configureJava()
configureWinstonePlugin()

dependencies {
    "server"(project(":mootools"))
}
