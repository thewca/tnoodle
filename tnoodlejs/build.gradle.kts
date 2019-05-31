import configurations.Languages.attachRemoteRepositories
import configurations.Languages.configureJava

import dependencies.Versions.GWT

import org.wisepersist.gradle.plugins.gwt.Style

description = "Compiles the scramble java code to javascript using GWT."

attachRemoteRepositories()

repositories {
    mavenLocal()
}

plugins {
    GWT
}

configureJava()

dependencies {
    implementation("org.worldcubeassociation.tnoodle:tnoodle-scrambles:${rootProject.version}")

    val dependentSourceProjects = listOf("tnoodle-scrambles", "tnoodle-svglite", "tnoodle-utils", "scrambler-min2phase", "scrambler-sq12phase", "scrambler-threephase")

    for (depProject in dependentSourceProjects) {
        gwt(group = "org.worldcubeassociation.tnoodle", name = depProject, version = rootProject.version.toString(), classifier = "sources")
    }
}

gwt {
    gwtVersion = GWT

    modules("scrambles")

    compiler.strict = true
    compiler.style = Style.PRETTY
}
