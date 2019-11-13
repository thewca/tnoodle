import configurations.CompilerSettings.KOTLIN_JVM_TARGET
import configurations.Languages.attachRepositories
import configurations.Languages.configureJava
import configurations.Languages.configureCheckstyle
import configurations.Languages.configureJUnit5
import configurations.Languages.configureMavenPublication

import dependencies.Libraries.GWTEXPORTER
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

description = "A Java scrambling suite. Java applications can use this project as a library. A perfect example of this is the webscrambles package."

attachRepositories()

plugins {
    `java-library`
    checkstyle
    `maven-publish`
    kotlin("jvm")
}

configureJava()
configureCheckstyle()
configureMavenPublication("tnoodle-scrambles")

dependencies {
    api(project(":svglite"))

    implementation(project(":min2phase"))
    implementation(project(":threephase"))
    implementation(project(":sq12phase"))

    implementation(kotlin("stdlib-jdk8"))

    api(GWTEXPORTER)
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = KOTLIN_JVM_TARGET
}

configureJUnit5()
