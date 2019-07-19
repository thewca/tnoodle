import configurations.Languages.configureJava

description = "A copy of Chen Shuang's square 1 two phase solver."

plugins {
    `java-library`
    `maven-publish`
}

configureJava()

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
        create<MavenPublication>("scrambler") {
            artifactId = "scrambler-sq12phase"

            from(components["java"])

            artifact(tasks["sourcesJar"])
            artifact(tasks["javadocJar"])
        }
    }
}
