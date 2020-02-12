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

include("awesome-ui")
include("cloudscrambles")
include("server-ktor")
include("tnoodle-ui")
include("webscrambles")
