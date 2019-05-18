import com.android.build.gradle.AppExtension

plugins {
    id("com.android.application")
    id("com.github.dcendents.android-maven")
}

configure<AppExtension> {
    compileSdkVersion(23)

    defaultConfig {
        minSdkVersion(8)
        targetSdkVersion(23)
    }

    sourceSets {
        getByName("main") {
            java.apply {
                srcDir("../../utils/src")
                exclude("net/gnehzr/tnoodle/utils/Launcher.java")
                exclude("net/gnehzr/tnoodle/utils/Launcher.java")
                exclude("net/gnehzr/tnoodle/utils/TNoodleLogging.java")
                exclude("net/gnehzr/tnoodle/utils/OneLineLogFormatter.java")
                exclude("net/gnehzr/tnoodle/utils/GsonUtils.java")

                srcDirs("../../sq12phase/src", "../../min2phase/src", "../../threephase/src")
                exclude("cs/min2phase/MainProgram.java")

                srcDir("../../scrambles/src")
                exclude("net/gnehzr/tnoodle/js/**")
                exclude("net/gnehzr/tnoodle/jre/**")
                exclude("net/gnehzr/tnoodle/test/**")
                exclude("net/gnehzr/tnoodle/scrambles/Main.java")
                exclude("net/gnehzr/tnoodle/scrambles/PuzzleImageInfo.java")

                srcDir("../../svglite/src")
            }

            resources.setSrcDirs(java.srcDirs)
        }
    }
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
