import com.android.build.gradle.AppExtension

plugins {
    id("com.android.application")
}

configure<AppExtension> {
    compileSdkVersion(28)

    defaultConfig {
        minSdkVersion(17)
        targetSdkVersion(28)
    }
}

repositories {
    jcenter()
    google()
}

dependencies {
    implementation("com.android.support:appcompat-v7:23.2.1")
    implementation("com.android.support:support-v4:23.2.1")

    implementation("com.caverock:androidsvg:1.2.1")

    implementation(project(":tnoodle-android:library"))
    implementation(project(":utils"))
}
