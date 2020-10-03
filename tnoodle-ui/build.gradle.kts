import com.moowork.gradle.node.NodeExtension

description = "A web ui for TNoodle that uses modern technology"

plugins {
    base
    NODEJS
}

configure<NodeExtension> {
    download = true
    version = "12.18.3"
}

tasks.getByName("yarn_build") {
    dependsOn("yarn_install")

    inputs.files(fileTree("src").exclude("*.css"))
    inputs.dir("public")
    inputs.file("package.json")

    outputs.dir("${project.buildDir}/static")
    outputs.file("${project.buildDir}/index.html")
}

tasks.getByName("yarn_install") {
    inputs.file("package.json")
    inputs.file("yarn.lock")

    outputs.dir("node_modules")
}

tasks.getByName("assemble") {
    dependsOn("packageReactFrontend")
}

tasks.getByName("check") {
    dependsOn("yarn_test")
}

tasks.getByName("yarn_test") {
    dependsOn("yarn_install")
}

tasks.create<Zip>("packageReactFrontend") {
    dependsOn("yarn_build")

    archiveBaseName.set("react-new-frontend")
    archiveExtension.set("jar")

    from("${project.buildDir}") {
        include("static/**/*")
        include("*.html")
        include("*.png")
        include("robots.txt")
        include("manifest.json")

        into("wca/tnoodle-ui")
    }
}

artifacts {
    add("default", tasks["packageReactFrontend"])
}
