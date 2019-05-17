plugins {
    java
    application
    id("com.github.johnrengelman.shadow") version "5.0.0"
}

description = "A very basic demo of a java servlet and a php page."

repositories {
    mavenCentral()
}

dependencies {
    implementation(project(":web-utils"))
    implementation(project(":quercus"))
    implementation(project(":winstone"))
}

application {
    mainClassName = "net.gnehzr.tnoodle.server.TNoodleServer"
}

configure<JavaPluginConvention> {
    sourceCompatibility = JavaVersion.VERSION_1_8
}
