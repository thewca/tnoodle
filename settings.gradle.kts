rootProject.name = "tnoodle"

pluginManagement {
    resolutionStrategy {
        eachPlugin {
            if (requested.id.id == "gwt") {
                useModule("org.wisepersist:gwt-gradle-plugin:${requested.version}")
            }
        }
    }
}

include("hello-winstone")
include("min2phase")
include("mootools")
include("quercus")
include("scrambler-interface")
include("scrambles")
include("sq12phase")
include("svglite")
include("threephase")
include("tnoodle-android")
include("tnoodle-android:library")
include("tnoodle-android:sample")
include("tnoodle-ui")
include("tnoodlejs")
include("utils")
include("web-utils")
include("webscrambles")
include("winstone")
