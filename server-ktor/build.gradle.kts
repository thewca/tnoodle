import configurations.Languages.attachRemoteRepositories

import dependencies.Libraries.APPLEJAVAEXTENSIONS
import dependencies.Libraries.JUNIT_JUPITER_API
import dependencies.Libraries.JUNIT_JUPITER_ENGINE
import dependencies.Libraries.NATIVE_TRAY_ADAPTER
import dependencies.Libraries.MARKDOWNJ_CORE

import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

description = "Embeddable webserver built around the Kotlin ktor framework"

attachRemoteRepositories()

plugins {
    kotlin("jvm")
}

dependencies {
    api("io.ktor:ktor-server-netty:1.2.0")

    implementation("io.ktor:ktor-server-host-common:1.2.0")
    implementation("io.ktor:ktor-gson:1.2.0")
    
    runtime("ch.qos.logback:logback-classic:1.2.3")
    
    implementation("com.xenomachina:kotlin-argparser:2.0.7")

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
