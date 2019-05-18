import configurations.Languages.attachRepositories

group = "org.worldcubeassociation"
version = "1.0-SNAPSHOT"

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
