import configurations.Languages.attachRemoteRepositories

import dependencies.Libraries.BATIK_TRANSCODER
import dependencies.Libraries.BOUNCYCASTLE
import dependencies.Libraries.ITEXTPDF
import dependencies.Libraries.JODA_TIME
import dependencies.Libraries.SNAKEYAML
import dependencies.Libraries.ZIP4J
import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
import proguard.gradle.ProGuardTask

description = "A server plugin wrapper for scrambles that also draws pdfs."

attachRemoteRepositories()

buildscript {
    repositories {
        maven(url = "$rootDir/gradle/repository")
    }

    dependencies {
        classpath("com.github.thewca:wca_i18n:0.4.3")
        classpath("net.sf.proguard:proguard-gradle:6.1.1")
    }
}

plugins {
    application
    SHADOW
    kotlin("jvm")
}

dependencies {
    implementation(kotlin("stdlib-jdk8"))
    
    implementation(project(":scrambles"))
    implementation(project(":server-ktor"))
    
    implementation(JODA_TIME)
    implementation(ZIP4J)
    implementation(ITEXTPDF)
    implementation(BATIK_TRANSCODER)
    implementation(SNAKEYAML)
    implementation(BOUNCYCASTLE)

    runtime(project(":tnoodle-ui"))
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = "1.8"
}

tasks.getByName("processResources") {
    dependsOn(":tnoodle-ui:assemble")
}

application {
    mainClassName = "org.worldcubeassociation.tnoodle.server.webscrambles.WebscramblesServer"
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

tasks.create<ProGuardTask>("proguardMinify") {
    injars("$buildDir/libs/${project.name}-$version-all.jar")
    outjars("$buildDir/minified/foofoo.jar")

    if (JavaVersion.current().isJava9Compatible) {
        libraryjars("${System.getProperty("java.home")}/jmods")
    } else {
        libraryjars("${System.getProperty("java.home")}/lib/rt.jar")
        libraryjars("${System.getProperty("java.home")}/lib/jce.jar")
    }

    libraryjars(configurations.findByName("runtimeClasspath")?.files)

    printmapping("$buildDir/minified/proguard.map")
    allowaccessmodification()
    dontskipnonpubliclibraryclassmembers()

    // FIXME...? Routes currently don't work in the browser when code gets obfuscated or optimised
    dontobfuscate()
    dontoptimize()

    keep("class org.worldcubeassociation.tnoodle.server.** { *; }")
    keep("class io.ktor.server.cio.CIO { *; }")
    keep("class kotlin.reflect.jvm.internal.** { *; }")
    keep("class kotlin.text.RegexOption { *; }")

    keepclasseswithmembernames("""class * {
        native <methods>;
    }""".trimIndent())

    keepclasseswithmembernames("""enum * {
        <fields>;
        public static **[] values();
        public static ** valueOf(java.lang.String);
    }""")

    dontwarn()
}

tasks.create("registerManifest") {
    tasks.withType<Jar> {
        dependsOn("registerManifest")
    }

    doLast {
        tasks.withType<Jar> {
            manifest {
                val version = project.findProperty("TNOODLE_VERSION") ?: "devel"

                attributes(
                    "Implementation-Title" to "TNoodle-WCA",
                    "Implementation-Version" to version
                )
            }
        }
    }
}
