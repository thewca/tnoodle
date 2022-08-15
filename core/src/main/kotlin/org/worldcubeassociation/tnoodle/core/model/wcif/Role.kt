package org.worldcubeassociation.tnoodle.core.model.wcif

import org.worldcubeassociation.tnoodle.core.serial.SingletonStringEncoder

data class Role(val roleString: String) {
    val isDelegate
        get() = roleString == ROLE_DELEGATE

    val isOrganizer
        get() = roleString == ROLE_ORGANIZER

    companion object : SingletonStringEncoder<Role>("Role") {
        const val ROLE_DELEGATE = "delegate"
        const val ROLE_ORGANIZER = "organizer"

        override fun encodeInstance(instance: Role) = instance.roleString
        override fun makeInstance(deserialized: String) = Role(deserialized)
    }
}
