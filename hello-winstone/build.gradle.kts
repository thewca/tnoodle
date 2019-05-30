import configurations.Languages.attachRemoteRepositories
import configurations.Languages.configureJava
import configurations.Server.configureEmbeddedRunnable
import configurations.Server.configureWinstonePlugin

description = "A very basic demo of a java servlet and a php page."

attachRemoteRepositories()

plugins {
    java
    application
    SHADOW
}

configureJava()
configureWinstonePlugin()

dependencies {
    "server"(project(":quercus"))
}

configureEmbeddedRunnable()
