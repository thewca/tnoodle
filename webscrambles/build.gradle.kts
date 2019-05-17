import configurations.Languages.configureJava
import configurations.Server.configureWinstonePlugin

import dependencies.Libraries.BATIK_ALL
import dependencies.Libraries.ITEXTPDF
import dependencies.Libraries.JODA_TIME
import dependencies.Libraries.SNAKEYAML
import dependencies.Libraries.ZIP4J

plugins {
    java
}

description = "A server plugin wrapper for scrambles that also draws pdfs."

repositories {
    mavenCentral()
}

dependencies {
    implementation(project(":scrambles"))
    implementation(project(":web-utils"))
    implementation(project(":winstone"))

    implementation(JODA_TIME)
    implementation(ZIP4J)
    implementation(ITEXTPDF)
    implementation(BATIK_ALL)
    implementation(SNAKEYAML)
}

configureJava()
configureWinstonePlugin()
