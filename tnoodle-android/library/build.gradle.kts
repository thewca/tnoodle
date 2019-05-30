import com.android.build.gradle.LibraryExtension

plugins {
    id("com.android.library")
    id("com.github.dcendents.android-maven")
}

configure<LibraryExtension> {
    compileSdkVersion(28)

    defaultConfig {
        minSdkVersion(8)
        targetSdkVersion(28)
    }
}

repositories {
    jcenter()
    google()
}

dependencies {
    api(project(":scrambles"))
}

// build a jar with source files
val sourcesJar = tasks.create<Jar>("sourcesJar") {
    archiveClassifier.set("sources")
    from(project(":scrambles").sourceSets["main"].java)
}

val javadoc = tasks.create<Javadoc>("javadoc") {
    isFailOnError = false

    source = project(":scrambles").sourceSets["main"].java.asFileTree

    classpath += project.files(options.bootClasspath)
    classpath += configurations["compile"]
}

// build a jar with javadoc
val javadocJar = tasks.register<Jar>("javadocJar") {
    dependsOn("javadoc")

    archiveClassifier.set("javadoc")
    from(javadoc.destinationDir)
}

artifacts {
    add("archives", sourcesJar)
    add("archives", javadocJar)
}
