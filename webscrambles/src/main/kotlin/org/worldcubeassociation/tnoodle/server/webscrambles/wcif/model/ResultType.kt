package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

enum class ResultType {
    SINGLE,
    AVERAGE;

    companion object {
        fun fromWCAString(wcaString: String) = values().find { it.name.toLowerCase() == wcaString }
    }
}
