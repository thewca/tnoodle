import configurations.Languages.configureJava

import dependencies.Libraries.JAVAX_SERVLET_API
import dependencies.Libraries.MARKDOWNJ_CORE

plugins {
    `java-library`
}

description="Dumping ground for useful Java functions used by web servlets"

repositories {
    mavenCentral()
}

dependencies {
    api(project(":utils"))
    api(JAVAX_SERVLET_API)

    implementation(MARKDOWNJ_CORE)
}

configureJava()
