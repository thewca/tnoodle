package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import org.worldcubeassociation.tnoodle.server.webscrambles.serial.SingletonStringEncoder

enum class ResultType {
    SINGLE,
    AVERAGE;

    val wcaString
        get() = this.name.toLowerCase()

    companion object : SingletonStringEncoder<ResultType>("ResultType") {
        fun fromWCAString(wcaString: String) = values().find { it.wcaString == wcaString }

        override fun encodeInstance(instance: ResultType) = instance.wcaString
        override fun makeInstance(deserialized: String) = fromWCAString(deserialized)!!
    }
}
