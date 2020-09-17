package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import org.worldcubeassociation.tnoodle.server.serial.SingletonStringEncoder
import org.worldcubeassociation.tnoodle.server.webscrambles.exceptions.BadWcifParameterException

enum class Gender(val wcaString: String) {
    MALE("m"),
    FEMALE("f"),
    OTHER("o");

    companion object : SingletonStringEncoder<Gender>("Gender") {
        fun fromWCAString(wcaString: String) = values().find { it.wcaString == wcaString }

        override fun encodeInstance(instance: Gender) = instance.wcaString
        override fun makeInstance(deserialized: String) = fromWCAString(deserialized)
            ?: BadWcifParameterException.error("Unknown WCIF spec Gender: '$deserialized'. Valid types: ${values().map { it.wcaString }}")
    }
}
