package configurations

import org.gradle.api.JavaVersion
import org.gradle.api.Project
import org.gradle.api.plugins.JavaPluginConvention

import org.gradle.kotlin.dsl.*

object Languages {
    fun Project.attachRepositories() {
        repositories {
            mavenCentral()
            maven(url = "$rootDir/gradle/repository")
        }
    }

    fun Project.configureJava() {
        configure<JavaPluginConvention> {
            sourceCompatibility = JavaVersion.VERSION_1_8
        }
    }
}
