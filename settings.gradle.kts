rootProject.name = "tnoodle"

pluginManagement {
    resolutionStrategy {
        eachPlugin {
            if (requested.id.id == "kotlin-multiplatform") {
                useModule("org.jetbrains.kotlin:kotlin-gradle-plugin:${requested.version}")
            }
        }
    }
}

include("cloudscrambles")
include("min2phase")
include("scrambles")
include("server-ktor")
include("sq12phase")
include("svglite")
include("threephase")
include("tnoodle-ui")
include("webscrambles")
