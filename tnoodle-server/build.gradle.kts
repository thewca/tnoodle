import configurations.CompilerSettings.KOTLIN_JVM_TARGET
import configurations.Languages.attachRemoteRepositories

import dependencies.Libraries.BOUNCYCASTLE
import dependencies.Libraries.KOTLIN_COROUTINES_CORE
import dependencies.Libraries.KTOR_SERIALIZATION
import dependencies.Libraries.KTOR_SERVER_NETTY
import dependencies.Libraries.KTOR_SERVER_HOST_COMMON
import dependencies.Libraries.KTOR_SERVER_SERVLET
import dependencies.Libraries.LOGBACK_CLASSIC
import dependencies.Libraries.KOTLIN_SERIALIZATION_JVM
import dependencies.Libraries.TNOODLE_SCRAMBLES

import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

description = "Embeddable webserver built around the Kotlin ktor framework"

attachRemoteRepositories()

plugins {
    kotlin("jvm")
    KOTLIN_SERIALIZATION
}

dependencies {
    api(KTOR_SERVER_NETTY)
    api(KOTLIN_SERIALIZATION_JVM)
    api(KOTLIN_COROUTINES_CORE)
    api(TNOODLE_SCRAMBLES)

    implementation(KTOR_SERIALIZATION)
    implementation(KTOR_SERVER_HOST_COMMON)
    implementation(KTOR_SERVER_SERVLET)
    implementation(BOUNCYCASTLE)

    runtimeOnly(LOGBACK_CLASSIC)
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = KOTLIN_JVM_TARGET
}
