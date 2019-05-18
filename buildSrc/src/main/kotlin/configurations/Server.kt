package configurations

import org.gradle.api.Project
import org.gradle.api.internal.artifacts.dependencies.DefaultProjectDependency
import org.gradle.api.plugins.ApplicationPluginConvention

import org.gradle.kotlin.dsl.*
import org.gradle.language.jvm.tasks.ProcessResources
import java.io.File
import java.nio.file.Files
import java.nio.file.StandardCopyOption

object Server {
    const val SERVER_MAIN = "net.gnehzr.tnoodle.server.TNoodleServer"
    const val WEB_INF_PATH = "tnoodle_resources/webapps/ROOT/WEB-INF"

    const val MERGING_SUFFIX = "TNOODLE_MERGED"

    fun Project.configureWinstonePlugin() {
        configurations {
            create("server")
        }

        dependencies {
            "implementation"(project(":winstone"))
            "server"(project(":winstone"))
        }
    }

    fun Project.configureEmbeddedRunnable() {
        tasks.withType<ProcessResources> {
            val rootFolder = file("${defaultResourcePath()}/$WEB_INF_PATH")
            val outputFolder = "$destinationDir/$WEB_INF_PATH"

            doFirst {
                val serverDependencies = project.serverDependencies() + project

                val webFiles = collectWebFiles(serverDependencies)
                val groupedWebFiles = webFiles.groupBy { it.name }

                for ((name, xmlFiles) in groupedWebFiles) {
                    val targetFile = file("$rootFolder/$name.$MERGING_SUFFIX").apply { delete() }

                    for (xmlFile in xmlFiles) { // TODO actual merging
                        targetFile.appendText("${xmlFile.absolutePath}\n")
                    }
                }

                for (dep in serverDependencies) {
                    from(dep.defaultResourcePath())
                }
            }

            doLast {
                val originalTempMerged = fileTree(rootFolder).matching { include("*.$MERGING_SUFFIX") }.files
                originalTempMerged.forEach(File::delete)

                val mergedFiles = fileTree(outputFolder).matching { include("*.$MERGING_SUFFIX") }.files

                for (mergedFile in mergedFiles) {
                    val originalFile = File(outputFolder, mergedFile.name.substringBeforeLast(".$MERGING_SUFFIX"))

                    Files.copy(mergedFile.toPath(), originalFile.toPath(), StandardCopyOption.REPLACE_EXISTING)
                    mergedFile.delete()
                }
            }
        }

        configure<ApplicationPluginConvention> {
            mainClassName = SERVER_MAIN
        }
    }

    private fun Project.collectWebFiles(dependencies: List<Project>): List<File> {
        return dependencies.flatMap {
            val webInfDir = "${it.defaultResourcePath()}/$WEB_INF_PATH"

            fileTree(webInfDir).matching {
                include("*.xml")
            }.files
        }
    }

    private fun Project.serverDependencies(): List<Project> {
        if (configurations.none { it.name == "server" }) {
            return emptyList()
        }

        val baseDeps = configurations["server"].dependencies
            .mapNotNull { it as? DefaultProjectDependency }
            .map { it.dependencyProject }

        return baseDeps
            .flatMap { it.serverDependencies() + it } // recursive dependency resolution
            .distinctBy { it.name }
    }

    private fun Project.defaultResourcePath() = "$projectDir/src/main/resources"
}
