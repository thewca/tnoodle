import configurations.CompilerSettings.KOTLIN_JVM_TARGET
import configurations.Languages.attachRemoteRepositories

import crypto.BuildVerification.SIGNATURE_PACKAGE
import crypto.BuildVerification.SIGNATURE_SUFFIX

import dependencies.Libraries.BOUNCYCASTLE
import dependencies.Libraries.KOTLIN_COROUTINES_CORE
import dependencies.Libraries.KTOR_SERVER_CONTENT_NEGOTIATION
import dependencies.Libraries.KTOR_SERVER_NETTY
import dependencies.Libraries.KTOR_SERVER_HOST_COMMON
import dependencies.Libraries.KTOR_SERVER_DEFAULT_HEADERS
import dependencies.Libraries.KTOR_SERVER_CORS
import dependencies.Libraries.KTOR_SERVER_SERVLET
import dependencies.Libraries.KTOR_SERIALIZATION_KOTLINX_JSON
import dependencies.Libraries.LOGBACK_CLASSIC
import dependencies.Libraries.KOTLIN_SERIALIZATION_JSON
import dependencies.Libraries.TNOODLE_SCRAMBLES

import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

description = "Embeddable webserver built around the Kotlin ktor framework"

attachRemoteRepositories()

plugins {
    kotlin("jvm")
    KOTLIN_SERIALIZATION
    KOTLINX_ATOMICFU
}

dependencies {
    api(KTOR_SERVER_NETTY)
    api(KTOR_SERVER_CONTENT_NEGOTIATION)
    api(KOTLIN_SERIALIZATION_JSON)
    api(KOTLIN_COROUTINES_CORE)
    api(TNOODLE_SCRAMBLES)

    implementation(KTOR_SERIALIZATION_KOTLINX_JSON)
    implementation(KTOR_SERVER_HOST_COMMON)
    implementation(KTOR_SERVER_DEFAULT_HEADERS)
    implementation(KTOR_SERVER_CORS)
    implementation(KTOR_SERVER_SERVLET)
    implementation(BOUNCYCASTLE)

    runtimeOnly(LOGBACK_CLASSIC)
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = KOTLIN_JVM_TARGET
}

tasks.create("deleteSignatures") {
    doLast {
        delete(fileTree("src/main/resources/$SIGNATURE_PACKAGE").matching {
            include("**/*.$SIGNATURE_SUFFIX")
        })
    }
}

tasks.withType<ProcessResources> {
    mustRunAfter(":registerReleaseTag")
    finalizedBy("deleteSignatures")
}
