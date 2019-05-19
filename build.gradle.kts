import configurations.Languages.attachRepositories

group = "org.worldcubeassociation"
version = "0.14.0"

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
    attachRepositories()
}

tasks.create<Copy>("generateOfficialRelease") {
    description = "Generate an official WCA release artifact. THIS WILL RUN TESTS!"
    group = "WCA"

    val targetProject = "webscrambles"

    dependsOn("$targetProject:check", ":$targetProject:shadowJarOfficial")

    from("$targetProject/build/libs") {
        include("$targetProject-wca.jar")
        rename("$targetProject-wca.jar", "TNoodle-WCA-$version.jar")
    }

    into(rootDir)
}

tasks.create<JavaExec>("startOfficialServer") {
    description = "Starts the TNoodle server from an official release artifact. Builds one if necessary"
    group = "WCA"

    dependsOn("generateOfficialRelease")

    main = "-jar"
    args = listOf("TNoodle-WCA-$version.jar")
}
