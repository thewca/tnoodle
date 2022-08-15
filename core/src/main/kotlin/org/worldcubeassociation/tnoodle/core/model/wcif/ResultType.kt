package org.worldcubeassociation.tnoodle.core.model.wcif

import org.worldcubeassociation.tnoodle.core.model.wcif.exception.BadWcifParameterException
import org.worldcubeassociation.tnoodle.core.serial.SingletonStringEncoder

enum class ResultType(val wcaString: String) {
    SINGLE("single"),
    AVERAGE("average");

    companion object : SingletonStringEncoder<ResultType>("ResultType") {
        fun fromWCAString(wcaString: String) = values().find { it.wcaString == wcaString }

        override fun encodeInstance(instance: ResultType) = instance.wcaString
        override fun makeInstance(deserialized: String) = fromWCAString(deserialized)
            ?: BadWcifParameterException.error("Unknown WCIF spec ResultType: '$deserialized'. Valid types: ${values().map { it.wcaString }}")
    }
}
