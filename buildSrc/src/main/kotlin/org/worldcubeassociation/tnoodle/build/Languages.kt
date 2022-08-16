package org.worldcubeassociation.tnoodle.build

import org.gradle.api.Project
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
        }
    }
}
