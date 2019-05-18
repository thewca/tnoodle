import configurations.Languages.attachRepositories
import configurations.Languages.configureJava
import configurations.Server.configureEmbeddedRunnable
import configurations.Server.configureWinstonePlugin

description = "A very basic demo of a java servlet and a php page."

attachRepositories()

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
