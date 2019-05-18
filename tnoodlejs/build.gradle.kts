import configurations.Languages.attachRepositories
import configurations.Languages.configureJava

import dependencies.Versions.GWT

import org.wisepersist.gradle.plugins.gwt.Style

description = "Compiles the scramble java code to javascript using GWT."

attachRepositories()

plugins {
    java
    GWT
}

configureJava()

dependencies {
    gwt(files("$projectDir/src/main/java"))

    val dependentSourceProjects = listOf("scrambles", "svglite", "utils", "min2phase", "sq12phase", "threephase")

    for (depProject in dependentSourceProjects) {
        gwt(files("$rootDir/$depProject/src/main/java"))
    }
}

gwt { // TODO move this configuration up to buildSrc perhaps?
    gwtVersion = GWT

    modules("scrambles")

    compiler.strict = true
    compiler.style = Style.PRETTY
}
