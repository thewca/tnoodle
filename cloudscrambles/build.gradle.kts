import configurations.CompilerSettings.KOTLIN_JVM_TARGET
import configurations.Languages.attachRemoteRepositories
import configurations.ProjectVersions.tNoodleImplOrDefault
import configurations.ProjectVersions.tNoodleVersionOrDefault
import dependencies.Libraries.BATIK_TRANSCODER
import dependencies.Libraries.BATIK_CODEC
import dependencies.Libraries.GOOGLE_CLOUD_STORAGE
import dependencies.Libraries.KOTLESS_KTOR
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

description = "An extension over the core server to expose scrambles in a Google Cloud environment"

attachRemoteRepositories()

plugins {
    kotlin("jvm")
    war
    KOTLIN_SERIALIZATION
    GOOGLE_APPENGINE
    //KOTLESS
}

dependencies {
    implementation(project(":tnoodle-server"))

    //implementation(KOTLESS_KTOR)
    implementation(GOOGLE_CLOUD_STORAGE)
    implementation(BATIK_TRANSCODER)

    runtimeOnly(BATIK_CODEC)
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
