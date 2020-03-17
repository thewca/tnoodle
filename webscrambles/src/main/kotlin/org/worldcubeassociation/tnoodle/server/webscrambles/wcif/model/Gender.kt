package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import org.worldcubeassociation.tnoodle.server.serial.SingletonStringEncoder

enum class Gender(val wcaString: String) {
    MALE("m"),
    FEMALE("f"),
    OTHER("o");

    companion object : SingletonStringEncoder<Gender>("Gender") {
        fun fromWCAString(wcaString: String) = values().find { it.wcaString == wcaString }

        override fun encodeInstance(instance: Gender) = instance.wcaString
        override fun makeInstance(deserialized: String) = fromWCAString(deserialized)!!
    }
}
