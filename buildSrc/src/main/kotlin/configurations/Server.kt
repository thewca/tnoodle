package configurations

import org.gradle.api.Project
import org.gradle.api.plugins.ApplicationPluginConvention

import org.gradle.kotlin.dsl.*
import org.gradle.language.jvm.tasks.ProcessResources

object Server {
    fun Project.configureWinstonePlugin() {
        dependencies {
            add("implementation", project(":winstone"))
        }

        tasks.withType<ProcessResources> {
            doLast {
                println("DOING STUFF!!")
            }
        }
    }

    fun Project.configureEmbeddedRunnable() {
        configure<ApplicationPluginConvention> {
            mainClassName = "net.gnehzr.tnoodle.server.TNoodleServer"
        }
    }
}
