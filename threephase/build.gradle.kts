plugins {
    `java-library`
}

description = "A copy of Chen Shuang's 4x4 scrambler."

dependencies {
    implementation(project(":min2phase"))
}

configure<JavaPluginConvention> {
    sourceCompatibility = JavaVersion.VERSION_1_8
}
