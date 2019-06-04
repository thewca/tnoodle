import com.moowork.gradle.node.NodeExtension
import com.moowork.gradle.node.yarn.YarnTask

description = "A web ui for TNoodle that uses modern technology, and interacts with the WCA website api to minimize repeated data entry."

plugins {
    base
    NODEJS
}

configure<NodeExtension> {
  download = true
}

tasks.create<YarnTask>("bundle") {
    dependsOn("yarn_install")

    inputs.files(fileTree("src"))
    inputs.files(fileTree("public"))
    inputs.file("package.json")

    outputs.dir("${project.buildDir}/static")

    setYarnCommand("build")
}

tasks.create<Copy>("propagateResources") {
    dependsOn("bundle")

    from("${project.buildDir}") {
        include("static/**/*")
        include("*.html")
    }

    val targetBaseDir = project(":webscrambles").buildDir
    into("$targetBaseDir/resources/main/tnoodle_resources/webapps/ROOT/wca/new-ui")
}

tasks.getByName("yarn_install") {
    inputs.file("package.json")
    inputs.file("yarn.lock")

    outputs.dir("node_modules")
}

tasks.getByName("assemble") {
    dependsOn("bundle", "propagateResources")
}

tasks.getByName("check") {
    dependsOn("yarn_test")
}

tasks.getByName("yarn_test") {
    dependsOn("bundle")
}
