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

buildscript {
    repositories {
        maven(url = "$rootDir/gradle/repository")
    }

    dependencies {
        classpath("com.github.thewca:wca_i18n:0.4.3")
    }
}

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

tasks.create<JavaExec>("i18nCheck") {
    val i18nDir = "$projectDir/src/main/resources/tnoodle_resources/i18n"
    val baseFile = file("$i18nDir/en.yml")

    val ymlFiles = fileTree(i18nDir).files - baseFile

    main = "JarMain" // Warbler gives *fantastic* class names to the jruby bundles :/
    classpath = buildscript.configurations["classpath"]

    setArgs(listOf(baseFile) + ymlFiles)
}

tasks.getByName("check") {
    dependsOn("i18nCheck")
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
