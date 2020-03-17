import com.google.cloud.tools.gradle.appengine.standard.AppEngineStandardExtension
import configurations.CompilerSettings.KOTLIN_JVM_TARGET
import configurations.Languages.attachRemoteRepositories
import configurations.ProjectVersions.gitVersionTag
import dependencies.Libraries.BATIK_TRANSCODER
import dependencies.Libraries.GOOGLE_CLOUD_STORAGE
import dependencies.Libraries.KOTLESS_KTOR
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

description = "An extension over the core server to expose scrambles in a Google Cloud environment"

attachRemoteRepositories()

plugins {
    kotlin("jvm")
    war
    GIT_VERSION_TAG
    KOTLIN_SERIALIZATION
    GOOGLE_APPENGINE
    KOTLESS
}

dependencies {
    implementation(kotlin("stdlib-jdk8"))

    implementation(project(":tnoodle-server"))

    implementation(KOTLESS_KTOR)
    implementation(GOOGLE_CLOUD_STORAGE)
    implementation(BATIK_TRANSCODER)
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = KOTLIN_JVM_TARGET
}

configure<AppEngineStandardExtension> {
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
        dependsOn("dumpVersionToFile")
    }

    doLast {
        val tNoodleTitle = project.findProperty("TNOODLE_IMPL")
            ?: "TNoodle-LOCAL"

        val tNoodleVersion = project.findProperty("TNOODLE_VERSION")
            ?: "devel-${project.gitVersionTag()}"

        val fileDir = "$projectDir/src/main/resources/version.tnoodle"
        file(fileDir).writeText("$tNoodleTitle\n$tNoodleVersion")
    }
}
