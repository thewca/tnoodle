import com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar
import configurations.CompilerSettings.KOTLIN_JVM_TOOLCHAIN
import configurations.CompilerSettings.KOTLIN_JVM_TARGET
import configurations.CompilerSettings.JAVA_BYTECODE_VERSION
import configurations.FileUtils.symlink
import configurations.Repositories.attachRemoteRepositories
import configurations.ProjectVersions.TNOODLE_SYMLINK
import configurations.ProjectVersions.tNoodleImplOrDefault
import configurations.ProjectVersions.tNoodleVersionOrDefault

description = "An extension over the core server to provide a user-friendly UI. Also draws PDFs."

attachRemoteRepositories()

plugins {
    kotlin("jvm")
    application
    alias(libs.plugins.shadow)
    alias(libs.plugins.kotlin.serialization)
}

dependencies {
    implementation(project(":server"))

    implementation(libs.markdownj.core)
    implementation(libs.kotlin.argparser)
    implementation(libs.system.tray)
    implementation(libs.ktor.server.cio)
    implementation(libs.ktor.server.netty)

    runtimeOnly(libs.logback.core)
    runtimeOnly(libs.logback.classic)

    runtimeOnly(project(":client"))
}

kotlin {
    jvmToolchain(KOTLIN_JVM_TOOLCHAIN)

    compilerOptions {
        jvmTarget.set(KOTLIN_JVM_TARGET)
    }
}

java {
    targetCompatibility = JAVA_BYTECODE_VERSION
}

application {
    mainClass.set("org.worldcubeassociation.tnoodle.deployable.jar.WebscramblesServer")
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
