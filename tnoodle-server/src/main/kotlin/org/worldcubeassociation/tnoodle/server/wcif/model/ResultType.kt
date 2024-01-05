package org.worldcubeassociation.tnoodle.server.wcif.model

import org.worldcubeassociation.tnoodle.server.serial.SingletonStringEncoder
import org.worldcubeassociation.tnoodle.server.exceptions.BadWcifParameterException

enum class ResultType(val wcaString: String) {
    SINGLE("single"),
    AVERAGE("average");

    companion object : SingletonStringEncoder<ResultType>("ResultType") {
        fun fromWCAString(wcaString: String) = entries.find { it.wcaString == wcaString }

        override fun encodeInstance(instance: ResultType) = instance.wcaString
        override fun makeInstance(deserialized: String) = fromWCAString(deserialized)
            ?: BadWcifParameterException.error("Unknown WCIF spec ResultType: '$deserialized'. Valid types: ${entries.map { it.wcaString }}")
    }
}
