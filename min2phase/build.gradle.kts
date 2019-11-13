import configurations.Languages.configureJava

description = "Chen Shuang's (https://github.com/cs0x7f) awesome 3x3 scrambler built on top of Herbert Kociemba's Java library."

plugins {
    `java-library`
    `maven-publish`
}

configureJava()

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
        }
    }
}
