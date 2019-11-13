package configurations

import dependencies.Libraries.JUNIT_JUPITER_API
import dependencies.Libraries.JUNIT_JUPITER_ENGINE
import org.gradle.api.Project
import org.gradle.api.plugins.quality.Checkstyle
import org.gradle.api.tasks.testing.Test
import org.gradle.kotlin.dsl.dependencies
import org.gradle.kotlin.dsl.withType

object Frameworks {
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
}
