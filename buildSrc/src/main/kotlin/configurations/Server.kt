package configurations

import org.gradle.api.Project
import org.gradle.api.internal.artifacts.dependencies.DefaultProjectDependency
import org.gradle.api.plugins.ApplicationPluginConvention
import org.gradle.api.tasks.bundling.Jar

import org.gradle.kotlin.dsl.*
import org.gradle.language.jvm.tasks.ProcessResources
import org.w3c.dom.Document
import org.xml.sax.InputSource
import java.io.File
import java.io.StringReader
import java.nio.file.Files
import java.nio.file.StandardCopyOption
import javax.xml.parsers.DocumentBuilderFactory
import javax.xml.transform.OutputKeys
import javax.xml.transform.TransformerFactory
import javax.xml.transform.dom.DOMSource
import javax.xml.transform.stream.StreamResult

object Server {
    const val SERVER_MAIN = "net.gnehzr.tnoodle.server.TNoodleServer"
    const val WEB_INF_PATH = "tnoodle_resources/webapps/ROOT/WEB-INF"

    const val MERGING_SUFFIX = "TNOODLE_MERGED"

    fun Project.configureWinstonePlugin() {
        configurations.create("server") {
            configurations["implementation"].extendsFrom(this)
        }

        dependencies {
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

                    mergeWebXMLFiles(xmlFiles, targetFile)
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

        tasks.withType<Jar> {
            manifest {
                attributes(mapOf(
                    "Implementation-Title" to "TNoodle-${project.name}"
                ))
            }
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
        if (configurations.findByName("server") == null) {
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

    private fun mergeWebXMLFiles(origFiles: List<File>, destFile: File) {
        val foo = origFiles.map { it.parseAsXML() }
            .reduce(this::mergeDocuments)

        val input = DOMSource(foo)
        val output = StreamResult(destFile)

        TRANSFORMER.transform(input, output)
    }

    private fun mergeDocuments(acc: Document, next: Document): Document {
        val nodeList = next.documentElement.childNodes

        for (i in 0 until nodeList.length) {
            val importNode = acc.importNode(nodeList.item(i), true)
            acc.documentElement.appendChild(importNode)
        }

        return acc
    }

    private fun File.parseAsXML(): Document {
        val xmlInput = InputSource(this.inputStream())

        return DOCUMENT_BUILDER.parse(xmlInput)
    }

    private val DOCUMENT_BUILDER_FACTORY = DocumentBuilderFactory.newInstance()
    private val DOCUMENT_BUILDER = DOCUMENT_BUILDER_FACTORY.newDocumentBuilder()

    private val TRANSFORMER_FACTORY = TransformerFactory.newInstance()
    private val TRANSFORMER = TRANSFORMER_FACTORY.newTransformer().apply { setOutputProperty(OutputKeys.INDENT, "yes") }
}
