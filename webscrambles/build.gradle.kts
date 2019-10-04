import com.google.cloud.tools.gradle.appengine.standard.AppEngineStandardExtension
import com.google.cloud.tools.gradle.appengine.standard.DevAppServerRunTask

import configurations.CompilerSettings.KOTLIN_JVM_TARGE
import configurations.Languages.attachRemoteRepositories

import dependencies.Libraries.BATIK_TRANSCODER
import dependencies.Libraries.BOUNCYCASTLE
import dependencies.Libraries.ITEXTPDF
import dependencies.Libraries.SNAKEYAML
import dependencies.Libraries.ZIP4J
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

description = "A server plugin wrapper for scrambles that also draws pdfs."

attachRemoteRepositories()

buildscript {
    repositories {
        maven(url = "$rootDir/gradle/repository")
    }

    dependencies {
        classpath(WCA_I18N)
    }
}

plugins {
    application
    SHADOW
    kotlin("jvm")
    war
    GOOGLE_APPENGINE
}

dependencies {
    implementation(kotlin("stdlib-jdk8"))

    implementation(project(":scrambles"))
    implementation(project(":server-ktor"))

    implementation(ZIP4J)
    implementation(ITEXTPDF)
    implementation(BATIK_TRANSCODER)
    implementation(SNAKEYAML)
    implementation(BOUNCYCASTLE)

    runtimeOnly(project(":tnoodle-ui"))
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = KOTLIN_JVM_TARGET
}

application {
    mainClassName = "org.worldcubeassociation.tnoodle.server.TNoodleServer"
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

tasks.create<JavaExec>("i18nCheck") {
    val i18nDir = "$projectDir/src/main/resources/i18n"
    val baseFile = file("$i18nDir/en.yml")

    val ymlFiles = fileTree(i18nDir).files - baseFile

    main = "JarMain" // Warbler gives *fantastic* class names to the jruby bundles :/
    classpath = buildscript.configurations["classpath"]

    setArgs(listOf(baseFile) + ymlFiles)
}

tasks.getByName("check") {
    dependsOn("i18nCheck")
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
