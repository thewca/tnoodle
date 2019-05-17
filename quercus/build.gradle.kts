plugins {
    `java-library`
}

description = "A 100% java implementation of php."

repositories {
    mavenCentral()
}

dependencies {
    runtime("com.h2database:h2:1.4.199")
    runtime("com.caucho:quercus:4.0.60")
}

configure<JavaPluginConvention> {
    sourceCompatibility = JavaVersion.VERSION_1_8
}

