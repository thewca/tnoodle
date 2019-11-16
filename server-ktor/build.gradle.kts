import configurations.CompilerSettings.KOTLIN_JVM_TARGET
import configurations.Languages.attachRemoteRepositories

import dependencies.Libraries.JUNIT_JUPITER_API
import dependencies.Libraries.JUNIT_JUPITER_ENGINE
import dependencies.Libraries.KTOR_GSON
import dependencies.Libraries.KTOR_SERVER_NETTY
import dependencies.Libraries.KTOR_SERVER_HOST_COMMON
import dependencies.Libraries.KTOR_SERVER_SERVLET
import dependencies.Libraries.LOGBACK_CLASSIC
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

    implementation(KTOR_SERVER_SERVLET)

    implementation(MARKDOWNJ_CORE)

    testImplementation(JUNIT_JUPITER_API)
    testRuntime(JUNIT_JUPITER_ENGINE)
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = KOTLIN_JVM_TARGET
}
