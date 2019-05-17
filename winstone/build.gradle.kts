import configurations.Languages.configureJava

import dependencies.Libraries.APPLEJAVAEXTENSIONS
import dependencies.Libraries.NATIVE_TRAY_ADAPTER
import dependencies.Libraries.URLREWRITEFILTER
import dependencies.Libraries.WINSTONE

plugins {
    `java-library`
}

description = "Tiny embeddable webserver that implements the java servlet spec."

repositories {
    mavenCentral()
}

dependencies {
    api(project(":web-utils"))

    implementation(WINSTONE)

    implementation(NATIVE_TRAY_ADAPTER)
    implementation(APPLEJAVAEXTENSIONS)
    implementation(URLREWRITEFILTER)
}

configureJava()
