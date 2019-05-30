import configurations.Languages.attachRemoteRepositories

import dependencies.Libraries.APPLEJAVAEXTENSIONS
import dependencies.Libraries.JUNIT_JUPITER_API
import dependencies.Libraries.JUNIT_JUPITER_ENGINE
import dependencies.Libraries.KOTLIN_ARGPARSER
import dependencies.Libraries.KTOR_GSON
import dependencies.Libraries.KTOR_SERVER_CIO
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
    api(KTOR_SERVER_CIO)
    api(KTOR_GSON)

    implementation(KTOR_SERVER_HOST_COMMON)

    runtime(LOGBACK_CLASSIC)
    
    implementation(KOTLIN_ARGPARSER)

    implementation(APPLEJAVAEXTENSIONS)
    implementation(NATIVE_TRAY_ADAPTER)
    implementation(MARKDOWNJ_CORE)

    testImplementation(JUNIT_JUPITER_API)
    testRuntime(JUNIT_JUPITER_ENGINE)
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = "1.8"
}

tasks.withType<Test> {
    useJUnitPlatform()

    testLogging {
        showStandardStreams = true
    }
}
