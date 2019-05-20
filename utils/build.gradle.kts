import configurations.Languages.attachRemoteRepositories
import configurations.Languages.configureJava
import configurations.Languages.configureCheckstyle

import dependencies.Libraries.GSON
import dependencies.Libraries.JOPT_SIMPLE

description = "Dumping ground for useful Java functions used throughout tnoodle"

attachRemoteRepositories()

plugins {
    `java-library`
    checkstyle
}

configureJava()
configureCheckstyle()

dependencies {
    api(project(":svglite"))

    api(GSON)
    api(JOPT_SIMPLE)
}
