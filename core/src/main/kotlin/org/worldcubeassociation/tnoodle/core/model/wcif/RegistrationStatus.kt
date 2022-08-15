package org.worldcubeassociation.tnoodle.core.model.wcif

import org.worldcubeassociation.tnoodle.core.model.wcif.exception.BadWcifParameterException
import org.worldcubeassociation.tnoodle.core.serial.SingletonStringEncoder

enum class RegistrationStatus(val wcaString: String) {
    ACCEPTED("accepted"),
    PENDING("pending"),
    DELETED("deleted");

    companion object : SingletonStringEncoder<RegistrationStatus>("RegistrationStatus") {
        fun fromWCAString(wcaString: String) = values().find { it.wcaString == wcaString }

        override fun encodeInstance(instance: RegistrationStatus) = instance.wcaString
        override fun makeInstance(deserialized: String) = fromWCAString(deserialized)
            ?: BadWcifParameterException.error("Unknown WCIF spec RegistrationStatus: '$deserialized'. Valid types: ${values().map { it.wcaString }}")
    }
}
