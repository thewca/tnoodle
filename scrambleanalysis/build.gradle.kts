import configurations.Languages.attachRemoteRepositories
import configurations.Languages.configureJUnit5
import configurations.Languages.configureJava

import dependencies.Libraries.JUNIT_JUPITER_API
import dependencies.Libraries.JUNIT_JUPITER_ENGINE

description = "Scramble quality checker that performs statistical analyses"

attachRemoteRepositories()

plugins {
    java
    application
}

configureJava()

dependencies {
    implementation(project(":scrambles"))
    implementation("org.apache.commons:commons-math3:3.6.1")

    testImplementation(JUNIT_JUPITER_API)
    testRuntime(JUNIT_JUPITER_ENGINE)
}

configureJUnit5()

application {
    mainClassName = "org.thewca.scrambleanalysis.App"
}
