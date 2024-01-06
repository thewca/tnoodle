import configurations.CompilerSettings
import configurations.CompilerSettings.KOTLIN_JVM_TOOLCHAIN
import configurations.Frameworks.configureJUnit5
import configurations.Languages.attachRemoteRepositories

import crypto.BuildVerification.SIGNATURE_PACKAGE
import crypto.BuildVerification.SIGNATURE_SUFFIX

description = "Embeddable webserver built around the Kotlin ktor framework"

attachRemoteRepositories()

buildscript {
    repositories {
        maven(url = "$rootDir/gradle/repository")
    }

    dependencies {
        classpath(libs.wca.i18n)
    }
}

plugins {
    kotlin("jvm")
    application
    alias(libs.plugins.kotlin.serialization)
    id("kotlinx-atomicfu")
}

dependencies {
    api(libs.ktor.server.core)
    api(libs.slf4j.api)
    api(libs.kotlinx.serialization.json)
    api(libs.tnoodle.scrambles)

    implementation(libs.tnoodle.scrambler.threephase)
    implementation(libs.zip4j)
    implementation(libs.itextpdf)
    implementation(libs.itext7)
    implementation(libs.itext7.bc.adapter)
    implementation(libs.batik.transcoder)
    implementation(libs.kotlinx.coroutines.core)
    implementation(libs.ktor.server.content.negotiation)
    implementation(libs.ktor.serialization.kotlinx.json)
    implementation(libs.ktor.server.cio)
    implementation(libs.ktor.server.host.common)
    implementation(libs.ktor.server.default.headers)
    implementation(libs.ktor.server.cors)
    implementation(libs.ktor.server.servlet)
    implementation(libs.ktor.server.websockets)
    implementation(libs.ktor.server.status.pages)
    implementation(libs.apache.commons.lang3)
    implementation(libs.bouncycastle)
    implementation(libs.snakeyaml)

    runtimeOnly(libs.bouncycastle)
    runtimeOnly(libs.logback.core)
    runtimeOnly(libs.logback.classic)
    runtimeOnly(libs.batik.codec)

    testImplementation(libs.mockk)
    testImplementation(libs.ktor.client.core)
    testImplementation(libs.ktor.client.cio)
    testImplementation(libs.ktor.client.content.negotiation)
    testImplementation(libs.ktor.serialization.kotlinx.json)
}

configureJUnit5()

kotlin {
    jvmToolchain(KOTLIN_JVM_TOOLCHAIN)

    compilerOptions {
        jvmTarget.set(CompilerSettings.KOTLIN_JVM_TARGET)
    }
}

java {
    targetCompatibility = CompilerSettings.JAVA_BYTECODE_VERSION
}

application {
    mainClass.set("io.ktor.server.cio.EngineMain")
}

tasks.create<JavaExec>("i18nCheck") {
    val ymlFiles = sourceSets.main.get().resources.matching {
        include("i18n/*.yml")
    }.sortedBy { it.nameWithoutExtension != "en" }

    mainClass.set("JarMain") // Warbler gives *fantastic* class names to the jruby bundles :/
    classpath = buildscript.configurations["classpath"]

    setArgs(ymlFiles)
}

tasks.getByName("check") {
    dependsOn("i18nCheck")
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

tasks.getByName<JavaExec>("run") {
    args = listOf("--nobrowser")
    jvmArgs = listOf("-Dio.ktor.development=true")
}
