import configurations.Languages.configureJava

plugins {
    `java-library`
}

description = "A copy of Chen Shuang's 4x4 scrambler."

dependencies {
    implementation(project(":min2phase"))
}

configureJava()