import configurations.Languages.attachLocalRepositories

buildscript {
    repositories {
        mavenCentral()
        google()
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

tasks.create<Copy>("generateOfficialRelease") {
    description = "Generate an official WCA release artifact."
    group = "WCA"

    val targetProject = "webscrambles"

    dependsOn(getTasksByName("publishToMavenLocal", true))
    dependsOn(":$targetProject:shadowJarOfficial")

    from("$targetProject/build/libs") {
        include("$targetProject-$version-wca.jar")
        rename("$targetProject-$version-wca.jar", "$releasePrefix-$version.jar")
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
