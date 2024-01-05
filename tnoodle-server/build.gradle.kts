import configurations.CompilerSettings.KOTLIN_JVM_TARGET
import configurations.Languages.attachRemoteRepositories

import crypto.BuildVerification.SIGNATURE_PACKAGE
import crypto.BuildVerification.SIGNATURE_SUFFIX

description = "Embeddable webserver built around the Kotlin ktor framework"

attachRemoteRepositories()

plugins {
    kotlin("jvm")
    alias(libs.plugins.kotlin.serialization)
    id("kotlinx-atomicfu")
}

dependencies {
    api(libs.ktor.server.core)
    api(libs.slf4j.api)
    api(libs.kotlinx.serialization.json)
    api(libs.tnoodle.scrambles)

    implementation(libs.zip4j)
    implementation(libs.itextpdf)
    implementation(libs.itext7)
    implementation(libs.batik.transcoder)
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.ktor.server.content.negotiation)
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.ktor.server.host.common)
    implementation(libs.ktor.server.default.headers)
    implementation(libs.ktor.server.cors)
    implementation(libs.ktor.server.servlet)
    implementation(libs.ktor.server.websockets)
    implementation(libs.ktor.server.status.pages)
    implementation(libs.apache.commons.lang3)
    implementation(libs.bouncycastle)
    implementation(libs.snakeyaml)

    runtimeOnly(libs.logback.core)
    runtimeOnly(libs.logback.classic)
}

kotlin {
    jvmToolchain(KOTLIN_JVM_TARGET)
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
