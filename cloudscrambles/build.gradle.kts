import com.google.cloud.tools.gradle.appengine.standard.AppEngineStandardExtension
import configurations.Languages.attachRemoteRepositories

import dependencies.Libraries.GOOGLE_CLOUD_STORAGE
import dependencies.Libraries.KOTLESS_KTOR
import io.kotless.DSLType
import io.kotless.plugin.gradle.dsl.kotless
import io.kotless.plugin.gradle.dsl.Webapp.Route53
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

description = "An extension over the webscrambles module to incorporate Google Cloud support"

attachRemoteRepositories()

plugins {
    kotlin("jvm")
    war
    GOOGLE_APPENGINE
    KOTLESS
}

dependencies {
    implementation(kotlin("stdlib-jdk8"))

    implementation(project(":webscrambles"))
    implementation(project(":server-ktor"))

    implementation(KOTLESS_KTOR)

    implementation(GOOGLE_CLOUD_STORAGE)
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = "1.8"
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
            ?: "devel" // TODO git-hash

        val fileDir = "$projectDir/src/main/resources/version.tnoodle"
        file(fileDir).writeText("$tNoodleTitle\n$tNoodleVersion")
    }
}

kotless {
    config {
        dsl {
            type = DSLType.Ktor
        }
    }
}
