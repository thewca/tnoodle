import configurations.Languages.attachRepositories
import configurations.Languages.configureJava
import configurations.Server.configureWinstonePlugin

import dependencies.Libraries.H2
import dependencies.Libraries.QUERCUS

description = "A 100% java implementation of php."

attachRepositories()

plugins {
    java
}

configureJava()
configureWinstonePlugin()

dependencies {
    runtime(H2)
    runtime(QUERCUS)
}
