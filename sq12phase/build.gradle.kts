import configurations.Languages.configureJava

description = "A copy of Chen Shuang's square 1 two phase solver."

plugins {
    `java-library`
    `maven-publish`
}

configureJava()

publishing {
    publications {
        create<MavenPublication>("scrambler") {
            artifactId = "scrambler-sq12phase"

            from(components["java"])
        }
    }
}
