import configurations.Languages.configureJava
import configurations.Server.configureEmbeddedRunnable
import configurations.Server.configureWinstonePlugin

plugins {
    java
    application
    SHADOW
}

description = "A very basic demo of a java servlet and a php page."

dependencies {
    implementation(project(":quercus"))
}

configureJava()
configureWinstonePlugin()
configureEmbeddedRunnable()
