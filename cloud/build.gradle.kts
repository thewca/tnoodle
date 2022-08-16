import org.worldcubeassociation.tnoodle.build.CompilerSettings.KOTLIN_JVM_TARGET
import org.worldcubeassociation.tnoodle.build.Languages.attachRemoteRepositories
import org.worldcubeassociation.tnoodle.build.ProjectVersions.tNoodleImplOrDefault
import org.worldcubeassociation.tnoodle.build.ProjectVersions.tNoodleVersionOrDefault
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

description = "An extension over the core server to expose scrambles in a Google Cloud environment"

attachRemoteRepositories()

plugins {
    kotlin("jvm")
    war
    alias(libs.plugins.kotlin.serialization)
    id("com.google.cloud.tools.appengine")
    //KOTLESS
}

dependencies {
    implementation(project(":core"))

    //implementation(libs.kotless.ktor)
    implementation(libs.google.cloud.storage)
    implementation(libs.batik.transcoder)

    runtimeOnly(libs.batik.codec)
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = KOTLIN_JVM_TARGET
}

appengine {
    run {
        projectId = "wca-scrambles-unofficial"
    }
    deploy {
        projectId = "wca-scrambles-unofficial"
        version = "GCLOUD_CONFIG"
    }
}

tasks.create("dumpVersionToFile") {
    tasks.withType<ProcessResources> {
        dependsOn(this@create)
    }

    val outFile = file("$projectDir/src/main/resources/version.tnoodle")
    outputs.file(outFile)

    doLast {
        val tNoodleTitle = project.tNoodleImplOrDefault()
        val tNoodleVersion = project.tNoodleVersionOrDefault()

        outFile.writeText("$tNoodleTitle\n$tNoodleVersion")
    }
}
