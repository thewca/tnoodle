import configurations.Languages.configureJava

description = "A copy of Chen Shuang's 4x4 scrambler."

plugins {
    `java-library`
}

configureJava()

dependencies {
    implementation(project(":min2phase"))
}
