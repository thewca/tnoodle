import configurations.CompilerSettings.KOTLIN_JVM_TOOLCHAIN
import configurations.Repositories.attachRemoteRepositories
import configurations.ProjectVersions.tNoodleImplOrDefault
import configurations.ProjectVersions.tNoodleVersionOrDefault

description = "An extension over the core server to expose scrambles in a Google Cloud environment"

attachRemoteRepositories()

plugins {
    kotlin("jvm")
    //war
    id("com.google.cloud.tools.appengine")
}

dependencies {
    implementation(project(":server"))

    implementation(libs.google.cloud.storage)
}

kotlin {
    jvmToolchain(KOTLIN_JVM_TOOLCHAIN)
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
