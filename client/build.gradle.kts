import com.github.gradle.node.NodeExtension

description = "A web ui for TNoodle that uses modern technology"

plugins {
    base
    alias(libs.plugins.nodejs)
}

configure<NodeExtension> {
    download = true
    version = libs.versions.nodejs
}

val yarnBuild = tasks.named("yarn_build") {
    dependsOn("yarn_install")

    inputs.files(fileTree("src/main").exclude("*.css"))
    inputs.dir("public")
    inputs.file("package.json")

    outputs.file(project.layout.buildDirectory.file("asset-manifest.json"))
    outputs.file(project.layout.buildDirectory.file("index.html"))
}

val yarnTest = tasks.named("yarn_test") {
    dependsOn(yarnBuild)
}

val yarnPrettier = tasks.named("yarn_prettier") {
    dependsOn("yarn_install")
}

tasks.getByName("check") {
    dependsOn(yarnTest)
    dependsOn(yarnPrettier)
}

tasks.getByName("assemble") {
    dependsOn("packageReactFrontend")
}

tasks.register<Zip>("packageReactFrontend") {
    dependsOn(yarnBuild)

    archiveBaseName = "react-new-frontend"
    archiveExtension = "jar"

    from(layout.buildDirectory) {
        include("static/**/*")
        include("*.html")
        include("*.png")
        include("robots.txt")
        include("manifest.json")

        into("ui")
    }
}

artifacts {
    add("default", tasks["packageReactFrontend"])
}
