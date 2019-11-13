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

publishing {
    publications {
        create<MavenPublication>("scrambler") {
            artifactId = "scrambler-threephase"

            from(components["java"])
        }
    }
}
