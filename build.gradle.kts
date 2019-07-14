import configurations.Languages.attachLocalRepositories

import proguard.gradle.ProGuardTask

buildscript {
    repositories {
        mavenCentral()
        google()
    }

    dependencies {
        classpath("net.sf.proguard:proguard-gradle:6.1.1")
    }
}

allprojects {
    group = "org.worldcubeassociation.tnoodle"
    version = "0.15.0"
    
    attachLocalRepositories()
}

plugins { 
    KOTLIN_JVM apply false
}

val releasePrefix = "TNoodle-WCA"

tasks.create("registerReleaseTag") {
    doFirst {
        project.ext.set("TNOODLE_VERSION", project.version)
    }
}

tasks.create<ProGuardTask>("generateOfficialRelease") {
    description = "Generate an official WCA release artifact."
    group = "WCA"

    val targetProject = "webscrambles"

    val targetBuildDir = project(":$targetProject").buildDir
    val targetConfigurations = project(":$targetProject").configurations

    dependsOn(getTasksByName("publishToMavenLocal", true))
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

    // cf. https://github.com/ktorio/ktor-samples/tree/master/other/proguard
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

tasks.create<JavaExec>("startOfficialServer") {
    description = "Starts the TNoodle server from an official release artifact. Builds one if necessary."
    group = "WCA"

    dependsOn("generateOfficialRelease")

    main = "-jar"
    args = listOf("$releasePrefix-$version.jar")
}
