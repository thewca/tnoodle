package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

enum class Gender(val wcaString: String) {
    MALE("m"),
    FEMALE("f"),
    OTHER("o");

    companion object {
        fun fromWCAString(wcaString: String) = values().find { it.wcaString == wcaString }
    }
}
