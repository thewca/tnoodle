import com.android.build.gradle.AppExtension
import dependencies.Libraries.ANDROIDSVG
import dependencies.Libraries.ANDROID_APPCOMPAT_V7
import dependencies.Libraries.ANDROID_SUPPORT_V4

import dependencies.Versions.ANDROID_SDK
import dependencies.Versions.ANDROID_SDK_MIN

plugins {
    ANDROID_APP
}

configure<AppExtension> {
    compileSdkVersion(ANDROID_SDK)

    defaultConfig {
        minSdkVersion(ANDROID_SDK_MIN)
        targetSdkVersion(ANDROID_SDK)
    }
}

repositories {
    jcenter()
    google()
    mavenLocal()
}

dependencies {
    implementation(ANDROID_APPCOMPAT_V7)
    implementation(ANDROID_SUPPORT_V4)

    implementation(ANDROIDSVG)

    implementation("${rootProject.group}:tnoodle-scrambles:${rootProject.version}")
    implementation("${rootProject.group}:tnoodle-utils:${rootProject.version}")
}
