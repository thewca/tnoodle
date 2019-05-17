import configurations.Languages.configureJava

import dependencies.Versions.GWT

import org.wisepersist.gradle.plugins.gwt.Style

plugins {
    java
    GWT
}

description = "Compiles the scramble java code to javascript using GWT."

repositories {
    mavenCentral()
}

dependencies {
    gwt(files("$projectDir/src/main/java"))

    val dependentSourceProjects = listOf("scrambles", "svglite", "utils", "min2phase", "sq12phase", "threephase")

    for (depProject in dependentSourceProjects) {
        gwt(files("$rootDir/$depProject/src/main/java"))
    }
}

configureJava()

gwt { // TODO move this configuration up to buildSrc
    gwtVersion = GWT

    modules("scrambles")

    compiler.strict = true
    compiler.style = Style.PRETTY
}
