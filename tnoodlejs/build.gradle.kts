import org.wisepersist.gradle.plugins.gwt.Style

plugins {
    java
    war
    id("gwt") version "1.0.8"
}

description = "Compiles the scramble java code to javascript using GWT."

repositories {
    mavenCentral()
}

dependencies {
    gwt(project(":scrambles"))

    val dependentSourceProjects = listOf("scrambles", "svglite", "utils", "min2phase", "sq12phase", "threephase")

    for (depProject in dependentSourceProjects) {
        gwt(files("../$depProject/src/main/java"))
    }
}

configure<JavaPluginConvention> {
    sourceCompatibility = JavaVersion.VERSION_1_8
}

gwt {
    gwtVersion = "2.5.1"

    modules("scrambles")

    compiler.strict = true
    compiler.style = Style.PRETTY
}
