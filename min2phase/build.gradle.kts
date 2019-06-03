import configurations.Languages.configureJava

description = "Chen Shuang's (https://github.com/cs0x7f) awesome 3x3 scrambler built on top of Herbert Kociemba's Java library."

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

sourceSets {
    main {
        java {
            exclude("cs/min2phase/MainProgram.java")
        }
    }
}

publishing {
    publications {
        create<MavenPublication>("scrambler") {
            artifactId = "scrambler-min2phase"

            from(components["java"])

            artifact(tasks["sourcesJar"])
            artifact(tasks["javadocJar"])
        }
    }
}
