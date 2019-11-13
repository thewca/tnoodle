package configurations

import dependencies.Libraries.JUNIT_JUPITER_API
import dependencies.Libraries.JUNIT_JUPITER_ENGINE
import org.gradle.api.JavaVersion
import org.gradle.api.Project
import org.gradle.api.plugins.JavaPluginConvention
import org.gradle.api.plugins.JavaPluginExtension
import org.gradle.api.plugins.quality.Checkstyle
import org.gradle.api.publish.PublishingExtension
import org.gradle.api.publish.maven.MavenPublication
import org.gradle.api.tasks.testing.Test

import org.gradle.kotlin.dsl.*

object Languages {
    fun Project.attachLocalRepositories() {
        repositories {
            maven(url = "$rootDir/gradle/repository")
        }
    }

    fun Project.attachRemoteRepositories() {
        repositories {
            mavenCentral()
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

    fun Project.configureCheckstyle() {
        tasks.withType<Checkstyle> {
            configFile = file("$rootDir/gradle/lint/tnoodle-java.xml")
        }
    }

    fun Project.configureJUnit5() {
        dependencies {
            add("testImplementation", JUNIT_JUPITER_API)
            add("testRuntimeOnly", JUNIT_JUPITER_ENGINE)
        }

        tasks.withType<Test> {
            useJUnitPlatform()

            testLogging {
                showStandardStreams = true
            }
        }
    }

    fun Project.configureMavenPublication(targetArtifactId: String? = null) {
        configure<PublishingExtension> {
            publications {
                create<MavenPublication>("scrambler") {
                    targetArtifactId?.let {
                        artifactId = it
                    }

                    from(components["java"])
                }
            }
        }
    }
}
