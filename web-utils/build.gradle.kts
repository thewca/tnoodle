import configurations.Languages.attachRemoteRepositories
import configurations.Languages.configureJava
import configurations.Languages.configureCheckstyle

import dependencies.Libraries.JAVAX_SERVLET_API
import dependencies.Libraries.MARKDOWNJ_CORE

description = "Dumping ground for useful Java functions used by web servlets"

attachRemoteRepositories()

plugins {
    `java-library`
    checkstyle
}

configureJava()
configureCheckstyle()

dependencies {
    api(project(":utils"))
    api(JAVAX_SERVLET_API)

    implementation(MARKDOWNJ_CORE)
}
