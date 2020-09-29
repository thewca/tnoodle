import configurations.Languages.attachLocalRepositories
import configurations.ProjectVersions.TNOODLE_SYMLINK
import configurations.ProjectVersions.setTNoodleRelease

import proguard.gradle.ProGuardTask

buildscript {
    repositories {
        mavenCentral()
        jcenter()
    }

    dependencies {
        classpath(PROGUARD_GRADLE) {
            exclude(group = "com.android.tools.build")
        }
        classpath(GOOGLE_APPENGINE_GRADLE)
        classpath(KOTLINX_ATOMICFU_GRADLE)
    }
}

allprojects {
    group = "org.worldcubeassociation.tnoodle"
    version = "1.0.3"

    attachLocalRepositories()
}

plugins {
    KOTLIN_JVM apply false
    DEPENDENCY_VERSIONS
}

val releasePrefix = "TNoodle-WCA"
val releaseProject = "webscrambles"

tasks.create("registerReleaseTag") {
    setTNoodleRelease(project.ext, releasePrefix)
}

tasks.create("registerCloudReleaseTag") {
    setTNoodleRelease(project.ext, "TNoodle-CLOUD")
}

tasks.create<ProGuardTask>("minifyRelease") {
    dependsOn("buildOfficial")

    configuration("proguard-rules.pro")

    injars(TNOODLE_SYMLINK)
    outjars("$releasePrefix-$version.jar")

    if (JavaVersion.current().isJava9Compatible) {
        libraryjars("${System.getProperty("java.home")}/jmods")
    } else {
        libraryjars("${System.getProperty("java.home")}/lib/rt.jar")
        libraryjars("${System.getProperty("java.home")}/lib/jce.jar")
    }

    val targetConfigurations = project(":$releaseProject").configurations
    libraryjars(targetConfigurations.findByName("runtimeClasspath")?.files)

    printmapping("$buildDir/minified/proguard.map")
}

tasks.create("buildOfficial") {
    description = "Generate an official WCA release artifact."
    group = "WCA"

    dependsOn("registerReleaseTag", ":$releaseProject:shadowJar")
}

tasks.create<JavaExec>("runOfficial") {
    description = "Starts the TNoodle server from an official release artifact. Builds one if necessary."
    group = "WCA"

    dependsOn("buildOfficial", "minifyRelease")

    main = "-jar"
    args = listOf("$releasePrefix-$version.jar")
}

tasks.create("buildDebug") {
    description = "Generate an unofficial JAR for testing purposes"
    group = "Development"

    dependsOn(":$releaseProject:shadowJar")
}

tasks.create("runDebug") {
    description = "Run an unofficial JAR for testing purposes"
    group = "Development"

    dependsOn(":$releaseProject:runShadow")
}

tasks.create("runBackend") {
    description = "Run an unofficial JAR that only holds the backend and nothing else. Visiting the localhost website WILL NOT WORK"
    group = "Development"

    dependsOn(":$releaseProject:run")
}

tasks.create("installCloud") {
    dependsOn("registerCloudReleaseTag", ":cloudscrambles:appengineDeploy")
}

tasks.create("installEmulateCloud") {
    dependsOn("registerCloudReleaseTag", ":cloudscrambles:appengineRun")
}
