import configurations.Languages.attachLocalRepositories

import dependencies.Libraries.ANDROID_BUILD_TOOLS

buildscript {
    repositories {
        mavenCentral()
        google()
    }

    dependencies {
        classpath(ANDROID_BUILD_TOOLS)
    }
}

allprojects {
    group = "org.worldcubeassociation.tnoodle"
    version = "0.14.0"
    
    attachLocalRepositories()
}

val releasePrefix = "TNoodle-WCA"

tasks.create<Copy>("generateOfficialRelease") {
    description = "Generate an official WCA release artifact."
    group = "WCA"

    val targetProject = "webscrambles"

    dependsOn(":$targetProject:shadowJarOfficial")

    from("$targetProject/build/libs") {
        include("$targetProject-wca.jar")
        rename("$targetProject-wca.jar", "$releasePrefix-$version.jar")
    }

    into(rootDir)
}

tasks.create<JavaExec>("startOfficialServer") {
    description = "Starts the TNoodle server from an official release artifact. Builds one if necessary."
    group = "WCA"

    dependsOn("generateOfficialRelease")

    main = "-jar"
    args = listOf("$releasePrefix-$version.jar")
}
