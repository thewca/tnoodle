package org.worldcubeassociation.tnoodle.build

import org.gradle.accessors.dm.LibrariesForLibs
import org.gradle.api.Project
import org.gradle.api.plugins.quality.Checkstyle
import org.gradle.api.tasks.testing.Test
import org.gradle.kotlin.dsl.dependencies
import org.gradle.kotlin.dsl.the
import org.gradle.kotlin.dsl.withType

object Frameworks {
    fun Project.configureCheckstyle() {
        tasks.withType<Checkstyle> {
            configFile = file("$rootDir/gradle/lint/tnoodle-java.xml")
        }
    }

    fun Project.configureJUnit5() {
        val libs = the<LibrariesForLibs>()

        dependencies {
            add("testImplementation", libs.junit.jupiter.api)
            add("testRuntimeOnly", libs.junit.jupiter.engine)
        }

        tasks.withType<Test> {
            useJUnitPlatform()

            testLogging {
                showStandardStreams = true
            }
        }
    }
}
