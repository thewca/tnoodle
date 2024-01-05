package org.worldcubeassociation.tnoodle.server.wcif.model

import org.worldcubeassociation.tnoodle.server.serial.types.SingletonStringEncoder
import org.worldcubeassociation.tnoodle.server.exceptions.BadWcifParameterException

enum class RegistrationStatus(val wcaString: String) {
    ACCEPTED("accepted"),
    PENDING("pending"),
    DELETED("deleted");

    companion object : SingletonStringEncoder<RegistrationStatus>("RegistrationStatus") {
        fun fromWCAString(wcaString: String) = entries.find { it.wcaString == wcaString }

        override fun encodeInstance(instance: RegistrationStatus) = instance.wcaString
        override fun makeInstance(deserialized: String) = fromWCAString(deserialized)
            ?: BadWcifParameterException.error("Unknown WCIF spec RegistrationStatus: '$deserialized'. Valid types: ${entries.map { it.wcaString }}")
    }
}
