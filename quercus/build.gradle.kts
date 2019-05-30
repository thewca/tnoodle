import configurations.Languages.attachRemoteRepositories
import configurations.Languages.configureJava
import configurations.Server.configureWinstonePlugin

import dependencies.Libraries.H2
import dependencies.Libraries.QUERCUS

description = "A 100% java implementation of php."

attachRemoteRepositories()

plugins {
    java
}

configureJava()
configureWinstonePlugin()

dependencies {
    runtime(H2)
    runtime(QUERCUS)
}
