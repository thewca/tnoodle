import configurations.Languages.attachLocalRepositories

import proguard.gradle.ProGuardTask

buildscript {
    repositories {
        mavenCentral()
    }

    dependencies {
        classpath(PROGUARD_GRADLE)
        classpath(GOOGLE_APPENGINE_GRADLE)
    }
}

allprojects {
    group = "org.worldcubeassociation.tnoodle"
    version = "1.0.0"

    attachLocalRepositories()
}

plugins {
    KOTLIN_JVM apply false
    DEPENDENCY_VERSIONS
}

val releasePrefix = "TNoodle-WCA"

tasks.create("registerReleaseTag") {
    doFirst {
        project.ext.set("TNOODLE_IMPL", releasePrefix)
        project.ext.set("TNOODLE_VERSION", project.version)
    }
}

tasks.create("registerCloudReleaseTag") {
    dependsOn("registerReleaseTag")

    doFirst {
        project.ext.set("TNOODLE_IMPL", "TNoodle-CLOUD")
    }
}

tasks.create<ProGuardTask>("generateOfficialRelease") {
    description = "Generate an official WCA release artifact."
    group = "WCA"

    val targetProject = "webscrambles"

    val targetBuildDir = project(":$targetProject").buildDir
    val targetConfigurations = project(":$targetProject").configurations

    dependsOn("registerReleaseTag", ":$targetProject:cleanShadowJar", ":$targetProject:shadowJar")

    injars("$targetBuildDir/libs/$targetProject-$version-all.jar")
    outjars("$releasePrefix-$version.jar")

    if (JavaVersion.current().isJava9Compatible) {
        libraryjars("${System.getProperty("java.home")}/jmods")
    } else {
        libraryjars("${System.getProperty("java.home")}/lib/rt.jar")
        libraryjars("${System.getProperty("java.home")}/lib/jce.jar")
    }

    libraryjars(targetConfigurations.findByName("runtimeClasspath")?.files)

    printmapping("$buildDir/minified/proguard.map")
    allowaccessmodification()
    dontskipnonpubliclibraryclassmembers()

    // FIXME...? Routes currently don't work in the browser when code gets obfuscated or optimised
    dontobfuscate()
    dontoptimize()

    dontnote("kotlinx.serialization.SerializationKt")

    // cf. https://github.com/ktorio/ktor-samples/tree/master/other/proguard
    keep("class org.worldcubeassociation.tnoodle.server.** { *; }")
    keep("class io.ktor.server.netty.Netty { *; }")
    keep("class kotlin.reflect.jvm.internal.** { *; }")
    keep("class kotlin.text.RegexOption { *; }")

    // CSS rendering uses reflection black magic, so static bytecode optimisers need a little help
    keep("class org.apache.batik.css.parser.** { *; }")
    keep("class org.apache.batik.dom.** { *; }")
    keep("class com.itextpdf.text.ImgTemplate { *; }")

    keep("class ch.qos.logback.core.** { *; }")

    keep("class com.sun.jna.** { *; }")
    keep("class dorkbox.util.jna.** { *; }")
    keep("class dorkbox.systemTray.** { *; }")

    keep(mapOf("includedescriptorclasses" to true), "class org.worldcubeassociation.tnoodle.server.webscrambles.**\$\$serializer { *; }")

    keepattributes("*Annotation")
    keepattributes("InnerClasses")

    keepclasseswithmembers("""
        class org.worldcubeassociation.tnoodle.server.webscrambles.** {
            kotlinx.serialization.KSerializer serializer(...);
        }
    """.trimIndent())

    keepclassmembers("""
        class org.worldcubeassociation.tnoodle.server.webscrambles.** {
            *** Companion;
        }
    """.trimIndent())

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

tasks.create<JavaExec>("startOfficialServer") {
    description = "Starts the TNoodle server from an official release artifact. Builds one if necessary."
    group = "WCA"

    dependsOn("generateOfficialRelease")

    main = "-jar"
    args = listOf("$releasePrefix-$version.jar")
}

tasks.create("generateDebugRelease") {
    dependsOn(":webscrambles:shadowJar")
}

tasks.create("startDebugServer") {
    dependsOn(":webscrambles:runShadow")
}

tasks.create("deployToCloud") {
    dependsOn("registerCloudReleaseTag", ":cloudscrambles:appengineDeploy")
}

tasks.create("emulateCloudLocal") {
    dependsOn("registerCloudReleaseTag", ":cloudscrambles:appengineRun")
}
