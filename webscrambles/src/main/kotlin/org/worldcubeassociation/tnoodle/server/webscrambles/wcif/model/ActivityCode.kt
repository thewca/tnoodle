package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.*
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.SingletonStringEncoder

@Serializable
data class ActivityCode(val activityCodeString: String) {
    @Serializer(forClass = ActivityCode::class)
    companion object : SingletonStringEncoder<ActivityCode>("ActivityCode") {
        // Currently, we mark not cubing related activities as other-lunch or other-speech, for example.
        // If we ever accept any other such ignorable key, it should be added here.
        val IGNORABLE_KEYS = listOf("other")

        override fun encodeInstance(instance: ActivityCode) = instance.activityCodeString
        override fun makeInstance(deserialized: String) = ActivityCode(deserialized)
    }
}
