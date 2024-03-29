package org.worldcubeassociation.tnoodle.server.wcif.model

import org.worldcubeassociation.tnoodle.server.serial.types.SingletonStringEncoder
import org.worldcubeassociation.tnoodle.server.exceptions.BadWcifParameterException

enum class Gender(val wcaString: String) {
    MALE("m"),
    FEMALE("f"),
    OTHER("o");

    companion object : SingletonStringEncoder<Gender>("Gender") {
        fun fromWCAString(wcaString: String) = entries.find { it.wcaString == wcaString }

        override fun encodeInstance(instance: Gender) = instance.wcaString
        override fun makeInstance(deserialized: String) = fromWCAString(deserialized)
            ?: BadWcifParameterException.error("Unknown WCIF spec Gender: '$deserialized'. Valid types: ${entries.map { it.wcaString }}")
    }
}
