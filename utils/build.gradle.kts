import configurations.Languages.configureJava

import dependencies.Libraries.GSON
import dependencies.Libraries.JOPT_SIMPLE

plugins {
    `java-library`
}

description = "Dumping ground for useful Java functions used throughout tnoodle"

repositories {
    mavenCentral()
}

dependencies {
    api(project(":svglite"))
    
    api(GSON)
    api(JOPT_SIMPLE)
}

configureJava()
