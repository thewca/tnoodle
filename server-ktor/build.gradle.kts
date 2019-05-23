import configurations.Languages.attachRemoteRepositories

import dependencies.Libraries.JUNIT_JUPITER_API
import dependencies.Libraries.JUNIT_JUPITER_ENGINE

import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

description = "Embeddable webserver built around the Kotlin ktor framework"

attachRemoteRepositories()

plugins {
    KOTLIN_JVM
}

dependencies {
    api(project(":utils"))

    api("io.ktor:ktor-server-netty:1.2.0")
    implementation("io.ktor:ktor-server-host-common:1.2.0")
    
    implementation("com.xenomachina:kotlin-argparser:2.0.7")

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
