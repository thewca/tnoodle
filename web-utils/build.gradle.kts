plugins {
    `java-library`
}

description="Dumping ground for useful Java functions used by web servlets"

repositories {
    mavenCentral()
}

dependencies {
    api(project(":utils"))
    api("javax.servlet:javax.servlet-api:4.0.1")

    implementation("org.markdownj:markdownj-core:0.4")
}

configure<JavaPluginConvention> {
    sourceCompatibility = JavaVersion.VERSION_1_8
}
