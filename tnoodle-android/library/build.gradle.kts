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

dependencies {
    implementation(project(":scrambles"))
}

// build a jar with source files
tasks.register<Jar>("sourcesJar") {
    //from(sourceSets["main"].java.srcDirs)
    archiveClassifier.set("sources")
}

val javadoc = tasks.create<Javadoc>("javadoc") {
    isFailOnError = false

    //source = sourceSets["main"].java.srcDirs

    classpath += project.files(options.bootClasspath)
    classpath += configurations["compile"]
}

// build a jar with javadoc
tasks.register<Jar>("javadocJar") {
    dependsOn("javadoc")

    archiveClassifier.set("javadoc")
    from(javadoc.destinationDir)
}

artifacts {
    //add("archive", "sourcesJar")
    //add("archive", "javadocJar")
}
