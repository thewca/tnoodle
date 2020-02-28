package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import org.worldcubeassociation.tnoodle.server.webscrambles.serial.SingletonStringEncoder

enum class RegistrationStatus {
    ACCEPTED,
    PENDING,
    DELETED;

    val wcaString
        get() = name.toLowerCase()

    companion object : SingletonStringEncoder<RegistrationStatus>("RegistrationStatus") {
        fun fromWCAString(wcaString: String) = values().find { it.wcaString == wcaString }

        override fun encodeInstance(instance: RegistrationStatus) = instance.wcaString
        override fun makeInstance(deserialized: String) = fromWCAString(deserialized)!!
    }
}
