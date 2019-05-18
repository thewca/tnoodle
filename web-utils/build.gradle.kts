import configurations.Languages.attachRepositories
import configurations.Languages.configureJava

import dependencies.Libraries.JAVAX_SERVLET_API
import dependencies.Libraries.MARKDOWNJ_CORE

description = "Dumping ground for useful Java functions used by web servlets"

attachRepositories()

plugins {
    `java-library`
}

configureJava()

dependencies {
    api(project(":utils"))
    api(JAVAX_SERVLET_API)

    implementation(MARKDOWNJ_CORE)
}
