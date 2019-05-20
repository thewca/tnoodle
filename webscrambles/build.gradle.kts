import com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar

import configurations.Languages.attachRemoteRepositories
import configurations.Languages.configureJava
import configurations.Languages.configureCheckstyle
import configurations.Server.SERVER_MAIN
import configurations.Server.configureWinstonePlugin
import configurations.Server.configureEmbeddedRunnable

import dependencies.Libraries.BATIK_TRANSCODER
import dependencies.Libraries.BOUNCYCASTLE
import dependencies.Libraries.ITEXTPDF
import dependencies.Libraries.JODA_TIME
import dependencies.Libraries.SNAKEYAML
import dependencies.Libraries.ZIP4J

description = "A server plugin wrapper for scrambles that also draws pdfs."

attachRemoteRepositories()

plugins {
    java
    checkstyle
    application
    SHADOW
}

configureJava()
configureCheckstyle()
configureWinstonePlugin()

dependencies {
    implementation(project(":scrambles"))

    implementation(JODA_TIME)
    implementation(ZIP4J)
    implementation(ITEXTPDF)
    implementation(BATIK_TRANSCODER)
    implementation(SNAKEYAML)
    implementation(BOUNCYCASTLE)

    "server"(project(":scrambler-interface"))

    runtime(project(":tnoodle-ui"))
}

configureEmbeddedRunnable()

tasks.getByName("processResources") {
    dependsOn(":tnoodle-ui:assemble")
}

tasks.create<ShadowJar>("shadowJarOfficial") {
    description = "compile a JAR file that can be used as official release"
    group = "shadow"

    archiveClassifier.set("wca")

    val origJarTask = tasks.getByName("jar") as? Jar
    origJarTask?.manifest?.also { manifest.inheritFrom(it) }

    manifest {
        attributes(mapOf(
            "Implementation-Title" to "TNoodle-WCA",
            "Implementation-Version" to project.rootProject.version,
            "Main-Class" to SERVER_MAIN
        ))
    }

    from(sourceSets["main"].output)
    exclude("META-INF/INDEX.LIST", "META-INF/*.SF", "META-INF/*.DSA", "META-INF/*.RSA", "module-info.class")

    val projectRuntime = project.configurations.findByName("runtimeClasspath")
        ?: project.configurations.findByName("runtime")

    configurations = listOfNotNull(projectRuntime)
}
