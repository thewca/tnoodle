import configurations.Languages.attachRepositories
import configurations.Languages.configureJava

import dependencies.Libraries.GWTEXPORTER
import dependencies.Libraries.GWT_USER
import dependencies.Libraries.JUNIT_JUPITER_API
import dependencies.Libraries.JUNIT_JUPITER_ENGINE

description = "A Java scrambling suite. Java applications can use this project as a library. A perfect example of this is the webscrambles package."

attachRepositories()

plugins {
    `java-library`
}

dependencies {
    api(project(":svglite"))
    api(project(":min2phase"))
    
    implementation(project(":utils"))
    implementation(project(":threephase"))
    implementation(project(":sq12phase"))

    implementation(GWT_USER)
    implementation(GWTEXPORTER)

    testImplementation(JUNIT_JUPITER_API)
    testRuntime(JUNIT_JUPITER_ENGINE)
}

configureJava()

tasks.withType<Test> {
    useJUnitPlatform()
}
