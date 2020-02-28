package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

data class Role(val roleString: String) {
    val isDelegate
        get() = roleString == ROLE_DELEGATE

    val isOrganizer
        get() = roleString == ROLE_ORGANIZER

    companion object {
        const val ROLE_DELEGATE = "delegate"
        const val ROLE_ORGANIZER = "organizer"
    }
}
