package configurations

import org.gradle.api.JavaVersion
import org.gradle.api.Project
import org.gradle.api.plugins.JavaPluginConvention
import org.gradle.api.plugins.JavaPluginExtension
import org.gradle.kotlin.dsl.configure
import org.gradle.kotlin.dsl.maven
import org.gradle.kotlin.dsl.repositories

object Languages {
    fun Project.attachLocalRepositories() {
        repositories {
            maven(url = "$rootDir/gradle/repository")
        }
    }

    fun Project.attachRemoteRepositories() {
        repositories {
            mavenCentral()
            maven(url = "https://dl.bintray.com/thewca/tnoodle-lib")
        }
    }

    fun Project.attachRepositories() {
        attachLocalRepositories()
        attachRemoteRepositories()
    }

    fun Project.configureJava() {
        configure<JavaPluginConvention> {
            sourceCompatibility = JavaVersion.VERSION_1_8
        }

        configure<JavaPluginExtension> {
            withJavadocJar()
            withSourcesJar()
        }
    }
}
