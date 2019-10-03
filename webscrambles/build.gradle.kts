import com.google.cloud.tools.gradle.appengine.standard.AppEngineStandardExtension

import configurations.CompilerSettings.KOTLIN_JVM_TARGET
import configurations.Languages.attachRemoteRepositories

import dependencies.Libraries.BATIK_TRANSCODER
import dependencies.Libraries.BOUNCYCASTLE
import dependencies.Libraries.ITEXTPDF
import dependencies.Libraries.SNAKEYAML
import dependencies.Libraries.ZIP4J
import dependencies.Plugins.GOOGLE_APPENGINE
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

apply {
    plugin(GOOGLE_APPENGINE)
}

plugins {
    application
    SHADOW
    kotlin("jvm")
    war
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

val cloudVersion = project.findProperty("TNOODLE_VERSION") as? String
    ?: "GCLOUD_CONFIG"

configure<AppEngineStandardExtension> {
    run {
        projectId = "wca-scrambles-unofficial"
        version = cloudVersion
    }
    deploy {
        projectId = "wca-scrambles-unofficial"
        version = cloudVersion
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

tasks.create("registerManifest") {
    tasks.withType<Jar> {
        dependsOn("registerManifest")
    }

    doLast {
        tasks.withType<Jar> {
            manifest {
                val version = project.findProperty("TNOODLE_VERSION") ?: "devel"

                attributes(
                    "Implementation-Title" to "TNoodle-WCA",
                    "Implementation-Version" to version
                )
            }
        }
    }
}
