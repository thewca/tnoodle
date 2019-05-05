plugins {
    java
    war
}

description = "A server plugin wrapper for scrambles that also draws pdfs."

repositories {
    mavenCentral()
}

dependencies {
    implementation(project(":web-utils"))
    implementation(project(":scrambles"))

    implementation("joda-time:joda-time:2.10.1")
    implementation("net.lingala.zip4j:zip4j:1.3.2")
    implementation("com.itextpdf:itextpdf:5.5.13")
    implementation("org.apache.xmlgraphics:batik-all:1.11")
    implementation("org.yaml:snakeyaml:1.24")
}

configure<JavaPluginConvention> {
    sourceCompatibility = JavaVersion.VERSION_1_8
}
