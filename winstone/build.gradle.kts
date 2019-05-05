plugins {
    java
    application
    id("com.github.johnrengelman.shadow") version "5.0.0"
}

description = "Tiny embeddable webserver that implements the java servlet spec."

repositories {
    mavenCentral()
}

dependencies {
    implementation(project(":web-utils"))

    implementation("net.sourceforge.winstone:winstone:0.9.10")

    implementation("com.github.taksan:native-tray-adapter:1.2-SNAPSHOT")
    implementation("com.apple:AppleJavaExtensions:1.4")
    implementation("org.tuckey:urlrewritefilter:4.0.3")
}

configure<JavaPluginConvention> {
    sourceCompatibility = JavaVersion.VERSION_1_8
}

application {
    mainClassName = "net.gnehzr.tnoodle.server.TNoodleServer"
}
