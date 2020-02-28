package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

enum class RegistrationStatus {
    ACCEPTED,
    PENDING,
    DELETED;

    companion object {
        fun fromWCAString(wcaString: String) = values().filter { it.name.toLowerCase() == wcaString }
    }
}
