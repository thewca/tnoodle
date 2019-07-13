import configurations.Languages.attachRepositories
import configurations.Languages.configureJava
import configurations.Languages.configureCheckstyle
import configurations.Languages.configureJUnit5

import dependencies.Libraries.GWTEXPORTER
import dependencies.Libraries.JUNIT_JUPITER_API
import dependencies.Libraries.JUNIT_JUPITER_ENGINE

description = "A Java scrambling suite. Java applications can use this project as a library. A perfect example of this is the webscrambles package."

attachRepositories()

plugins {
    `java-library`
    checkstyle
    `maven-publish`
}

configureJava()
configureCheckstyle()

dependencies {
    api(project(":svglite"))

    implementation(project(":min2phase"))
    implementation(project(":threephase"))
    implementation(project(":sq12phase"))

    api(GWTEXPORTER)

    testImplementation(JUNIT_JUPITER_API)
    testRuntime(JUNIT_JUPITER_ENGINE)
}

configureJUnit5()

tasks.create<Jar>("sourcesJar") {
    archiveClassifier.set("sources")
    from(sourceSets.main.get().allJava)
}

tasks.create<Jar>("javadocJar") {
    archiveClassifier.set("javadoc")
    from(tasks.javadoc.get().destinationDir)
}

publishing {
    publications {
        create<MavenPublication>("scrambles") {
            artifactId = "tnoodle-scrambles"

            from(components["java"])

            artifact(tasks["sourcesJar"])
            artifact(tasks["javadocJar"])
        }
    }
}
