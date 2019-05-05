plugins {
    `java-library`
}

description="Dumping ground for useful Java functions used throughout tnoodle"

repositories {
    mavenCentral()
}

dependencies {
    api(project(":svglite"))
    
    api("com.google.code.gson:gson:2.8.5")
    api("net.sf.jopt-simple:jopt-simple:3.2")
}

configure<JavaPluginConvention> {
    sourceCompatibility = JavaVersion.VERSION_1_8
}
