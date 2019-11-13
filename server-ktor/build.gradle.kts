import configurations.Languages.attachRemoteRepositories

import dependencies.Libraries.APPLEJAVAEXTENSIONS
import dependencies.Libraries.KOTLIN_ARGPARSER
import dependencies.Libraries.KTOR_GSON
import dependencies.Libraries.KTOR_SERVER_NETTY
import dependencies.Libraries.KTOR_SERVER_HOST_COMMON
import dependencies.Libraries.LOGBACK_CLASSIC
import dependencies.Libraries.NATIVE_TRAY_ADAPTER
import dependencies.Libraries.MARKDOWNJ_CORE

import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

description = "Embeddable webserver built around the Kotlin ktor framework"

attachRemoteRepositories()

plugins {
    kotlin("jvm")
}

dependencies {
    api(KTOR_SERVER_NETTY)
    api(KTOR_GSON)

    implementation(KTOR_SERVER_HOST_COMMON)

    runtimeOnly(LOGBACK_CLASSIC)

    implementation(KOTLIN_ARGPARSER)

    implementation(APPLEJAVAEXTENSIONS)
    implementation(NATIVE_TRAY_ADAPTER)
    implementation(MARKDOWNJ_CORE)
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = "1.8"
}
