import configurations.Languages.configureJava
import configurations.Languages.configureMavenPublication

description = "A copy of Chen Shuang's 4x4 scrambler."

plugins {
    `java-library`
    `maven-publish`
}

configureJava()
configureMavenPublication("scrambler-threephase")

dependencies {
    implementation(project(":min2phase"))
}
