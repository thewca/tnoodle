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
    `maven-publish`
}

configureJava()
configureCheckstyle()

dependencies {
    api(project(":svglite"))

    api(GSON)
    api(JOPT_SIMPLE)
}

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
        create<MavenPublication>("utils") {
            artifactId = "tnoodle-utils"

            from(components["java"])

            artifact(tasks["sourcesJar"])
            artifact(tasks["javadocJar"])
        }
    }
}

