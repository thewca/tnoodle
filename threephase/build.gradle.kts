import configurations.Languages.configureJava

description = "A copy of Chen Shuang's 4x4 scrambler."

plugins {
    `java-library`
    `maven-publish`
}

configureJava()

dependencies {
    implementation(project(":min2phase"))
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
        create<MavenPublication>("scrambler") {
            artifactId = "scrambler-threephase"

            from(components["java"])

            artifact(tasks["sourcesJar"])
            artifact(tasks["javadocJar"])
        }
    }
}
