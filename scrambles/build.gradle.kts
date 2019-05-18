import configurations.Languages.attachRepositories
import configurations.Languages.configureJava

import dependencies.Libraries.GWTEXPORTER
import dependencies.Libraries.GWT_USER

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
}

configureJava()
