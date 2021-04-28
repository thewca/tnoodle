plugins {
    `kotlin-dsl`
}

repositories {
    mavenCentral()
    jcenter()
}

dependencies {
    implementation("org.bouncycastle:bcprov-jdk15on:1.68")
    implementation("org.eclipse.jgit:org.eclipse.jgit:5.11.0.202103091610-r")
}
