import configurations.Languages.configureJava
import configurations.Server.configureWinstonePlugin

import dependencies.Libraries.H2
import dependencies.Libraries.QUERCUS

plugins {
    `java-library`
}

description = "A 100% java implementation of php."

repositories {
    mavenCentral()
}

dependencies {
    runtime(H2)
    runtime(QUERCUS)
}

configureJava()
configureWinstonePlugin()

