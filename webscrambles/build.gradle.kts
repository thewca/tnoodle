import com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar
import configurations.CompilerSettings.KOTLIN_JVM_TARGET
import configurations.FileUtils.symlink
import configurations.Frameworks.configureJUnit5
import configurations.Languages.attachRemoteRepositories
import configurations.ProjectVersions.TNOODLE_SYMLINK
import configurations.ProjectVersions.tNoodleImplOrDefault
import configurations.ProjectVersions.tNoodleVersionOrDefault

import dependencies.Libraries.APACHE_COMMONS_LANG3
import dependencies.Libraries.BATIK_TRANSCODER
import dependencies.Libraries.BOUNCYCASTLE
import dependencies.Libraries.ITEXTPDF
import dependencies.Libraries.KOTLIN_ARGPARSER
import dependencies.Libraries.KTOR_WEBSOCKETS
import dependencies.Libraries.MARKDOWNJ_CORE
import dependencies.Libraries.SNAKEYAML
import dependencies.Libraries.SYSTEM_TRAY
import dependencies.Libraries.TESTING_MOCKK
import dependencies.Libraries.ZIP4J

import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

description = "An extension over the core server to provide a user-friendly UI. Also draws PDFs."

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
    kotlin("jvm")
    application
    SHADOW
    KOTLIN_SERIALIZATION
}

configurations {
    create("deployable") {
        extendsFrom(configurations["default"])
    }
}

dependencies {
    implementation(project(":tnoodle-server"))

    implementation(ZIP4J)
    implementation(MARKDOWNJ_CORE)
    implementation(ITEXTPDF)
    implementation(BATIK_TRANSCODER)
    implementation(SNAKEYAML)
    implementation(KOTLIN_ARGPARSER)
    implementation(SYSTEM_TRAY)
    implementation(APACHE_COMMONS_LANG3)
    implementation(KTOR_WEBSOCKETS)

    runtimeOnly(BOUNCYCASTLE)

    "deployable"(project(":tnoodle-ui"))

    testImplementation(TESTING_MOCKK)
}

configureJUnit5()

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = KOTLIN_JVM_TARGET
}

application {
    mainClass.set("org.worldcubeassociation.tnoodle.server.webscrambles.WebscramblesServer")
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
        dependsOn(this@create)
    }

    doLast {
        tasks.withType<Jar> {
            manifest {
                attributes(
                    "Implementation-Title" to project.tNoodleImplOrDefault(),
                    "Implementation-Version" to project.tNoodleVersionOrDefault()
                )
            }
        }
    }
}

tasks.getByName<ShadowJar>("shadowJar") {
    configurations = listOf(project.configurations["deployable"])

    val targetLn = rootProject.file(TNOODLE_SYMLINK)
    outputs.file(targetLn)

    doLast {
        val targetFileAbs = archiveFile.orNull?.asFile
            ?.relativeToOrNull(rootProject.projectDir)

        val created = targetFileAbs?.let { symlink(targetLn, it) } ?: false

        if (!created) {
            logger.warn("Unable to (re-)create symlink for latest release! Using top-level Gradle tasks will implicitly reference an older build!")
        }
    }
}

tasks.getByName<JavaExec>("run") {
    args = listOf("--nobrowser")
    jvmArgs = listOf("-Dio.ktor.development=true")
}
