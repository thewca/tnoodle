import configurations.Languages.attachLocalRepositories

buildscript {
    repositories {
        mavenCentral()
        google()
    }

    dependencies {
        classpath("com.android.tools.build:gradle:3.4.1")
        classpath("com.github.dcendents:android-maven-gradle-plugin:2.1")
    }
}

allprojects {
    group = "org.worldcubeassociation.tnoodle"
    version = "0.14.0"
    
    attachLocalRepositories()
}

tasks.create<Copy>("generateOfficialRelease") {
    description = "Generate an official WCA release artifact. THIS WILL RUN TESTS!"
    group = "WCA"

    val targetProject = "webscrambles"

    dependsOn(getTasksByName("check", true))
    dependsOn(":$targetProject:shadowJarOfficial")

    from("$targetProject/build/libs") {
        include("$targetProject-wca.jar")
        rename("$targetProject-wca.jar", "TNoodle-WCA-$version.jar")
    }

    into(rootDir)
}

tasks.create<JavaExec>("startOfficialServer") {
    description = "Starts the TNoodle server from an official release artifact. Builds one if necessary."
    group = "WCA"

    dependsOn("generateOfficialRelease")

    main = "-jar"
    args = listOf("TNoodle-WCA-$version.jar")
}
