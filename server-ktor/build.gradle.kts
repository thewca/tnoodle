import configurations.CompilerSettings.KOTLIN_JVM_TARGET
import configurations.Languages.attachRemoteRepositories

import dependencies.Libraries.BOUNCYCASTLE
import dependencies.Libraries.KTOR_SERIALIZATION
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
    KOTLIN_SERIALIZATION
}

dependencies {
    api(KTOR_SERVER_NETTY)
    api(KTOR_SERIALIZATION)

    implementation(KTOR_SERVER_HOST_COMMON)
    implementation(KTOR_SERVER_SERVLET)

    implementation(BOUNCYCASTLE)
    implementation(MARKDOWNJ_CORE)

    runtimeOnly(LOGBACK_CLASSIC)
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = KOTLIN_JVM_TARGET
}
