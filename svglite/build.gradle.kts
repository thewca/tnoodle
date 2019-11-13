import configurations.Languages.attachRemoteRepositories
import configurations.Languages.configureJava
import configurations.Languages.configureCheckstyle

description = "A dead simple svg generation library written in pure Java, with no dependencies. This code runs on both desktop Java, Android, and compiles to Javascript with GWT."

attachRemoteRepositories()

plugins {
    `java-library`
    checkstyle
    `maven-publish`
}

configureJava()
configureCheckstyle()

publishing {
    publications {
        create<MavenPublication>("svglite") {
            artifactId = "tnoodle-svglite"

            from(components["java"])
        }
    }
}
