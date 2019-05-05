plugins {
    java
    application
    id("com.github.johnrengelman.shadow") version "5.0.0"
}

description = "A very basic demo of a java servlet and a php page."

repositories {
    mavenCentral()
    jcenter()
}

dependencies {
    implementation(project(":web-utils"))

    implementation("com.h2database:h2:1.4.199")
}

application {
    mainClassName = "net.gnehzr.tnoodle.server.TNoodleServer"
}

configure<JavaPluginConvention> {
    sourceCompatibility = JavaVersion.VERSION_1_8
}

tasks {
    val resourceRoot = sourceSets["main"].output.resourcesDir
    val tnoodleResources = "$resourceRoot/tnoodle_resources"

    val webInf = "$tnoodleResources/webapps/ROOT/WEB-INF"
    val libDir = "$webInf/lib"
    val classesDir = "$webInf/classes"

    create<Copy>("copyStuff") {
        delete(libDir)

        into(libDir)
        from(configurations.runtimeClasspath.get().exclude("tnoodle"))
    }
}
