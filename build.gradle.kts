import configurations.Languages.attachLocalRepositories
import configurations.ProjectVersions.TNOODLE_SYMLINK
import configurations.ProjectVersions.setTNoodleRelease
import crypto.BuildVerification.SIGNATURE_PACKAGE
import crypto.BuildVerification.SIGNATURE_SUFFIX

import crypto.BuildVerification.createBuildSignature

import proguard.gradle.ProGuardTask

buildscript {
    repositories {
        mavenCentral()
    }

    dependencies {
        classpath(libs.proguard.gradle)
        classpath(libs.google.appengine.gradle)
        classpath(libs.kotlinx.atomicfu.gradle)
    }
}

allprojects {
    group = "org.worldcubeassociation.tnoodle"
    version = "1.2.2"

    attachLocalRepositories()

    tasks.withType<Jar> {
        duplicatesStrategy = DuplicatesStrategy.EXCLUDE
    }
}

plugins {
    kotlin("jvm") version libs.versions.kotlin apply false
    alias(libs.plugins.dependency.versions)
}

val releasePrefix = "TNoodle-WCA"
val releaseProject = "deployable-jar"

tasks.create("registerReleaseTag") {
    val signatureProject = project(":server")
    val filenameToSign = "rsa/tnoodle_public.pem"

    val signatureStorage = signatureProject.file("src/main/resources/$SIGNATURE_PACKAGE/$filenameToSign.$SIGNATURE_SUFFIX")

    outputs.file(signatureStorage)

    // prevent caching this task, so that it always runs no matter what
    outputs.upToDateWhen { false }

    doFirst {
        val privateKeyPath = project.findProperty("wca.wst.signature-private-key")?.toString()
            ?: error("You have to provide a path to a PKCS8 private key for official releases!")

        val fileToSign = signatureProject.file("src/main/resources/$filenameToSign")
        val signature = createBuildSignature(privateKeyPath, fileToSign)

        signatureStorage.writeBytes(signature)

        setTNoodleRelease(project.ext, releasePrefix)
    }
}

tasks.create("registerCloudReleaseTag") {
    doFirst {
        setTNoodleRelease(project.ext, "TNoodle-CLOUD")
    }
}

tasks.create<ProGuardTask>("minifyRelease") {
    dependsOn("registerReleaseTag", "buildOfficial")

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

    printmapping(layout.buildDirectory.file("proguard.map"))
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

    mainClass.set("-jar")
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

    dependsOn(":server:run")
}

tasks.create("installCloud") {
    dependsOn("registerCloudReleaseTag", ":cloudscrambles:appengineDeploy")
}

tasks.create("emulateCloud") {
    dependsOn("registerCloudReleaseTag", ":cloudscrambles:appengineRun")
}
