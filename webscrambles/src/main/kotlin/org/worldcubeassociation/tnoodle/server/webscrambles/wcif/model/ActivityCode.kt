package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.*
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.SingletonStringEncoder

@Serializable
data class ActivityCode(val activityCodeString: String) {
    @Transient
    private val activityParts = activityCodeString.split(WCIF_DELIMITER)

    val eventId: String
        get() = activityParts.first()

    @Transient
    private val structureParts = activityParts
        .drop(1) // drop eventId prefix
        .associateBy { it.first() }
        .mapValues { it.value.drop(1) }

    val roundNumber: Int?
        get() = intPart(WCIF_PREFIX_ROUND)

    val groupNumber: Int?
        get() = intPart(WCIF_PREFIX_GROUP)

    val attemptNumber: Int?
        get() = intPart(WCIF_PREFIX_ATTEMPT)

    private fun intPart(prefix: Char): Int? = structureParts[prefix]?.toIntOrNull()

    fun isParentOf(child: ActivityCode): Boolean {
        return eventId == child.eventId
            && structureParts.all { child.structureParts[it.key] == it.value }
    }

    fun copyParts(eventId: String = this.eventId, roundNumber: Int? = this.roundNumber, groupNumber: Int? = this.groupNumber, attemptNumber: Int? = this.attemptNumber): ActivityCode {
        return compile(eventId, roundNumber, groupNumber, attemptNumber)
    }

    companion object : SingletonStringEncoder<ActivityCode>("ActivityCode") {
        // Currently, we mark not cubing related activities as other-lunch or other-speech, for example.
        // If we ever accept any other such ignorable key, it should be added here.
        val IGNORABLE_KEYS = listOf("other")

        const val WCIF_DELIMITER = "-"

        const val WCIF_PREFIX_ROUND = 'r'
        const val WCIF_PREFIX_GROUP = 'g'
        const val WCIF_PREFIX_ATTEMPT = 'a'

        fun compile(event: String, round: Int? = null, group: Int? = null, attempt: Int? = null): ActivityCode {
            val parts = listOfNotNull(
                round?.let { "$WCIF_PREFIX_ROUND$it" },
                group?.let { "$WCIF_PREFIX_GROUP$it" },
                attempt?.let { "$WCIF_PREFIX_ATTEMPT$it" }
            )

            val specifier = parts.joinToString(WCIF_DELIMITER)
            val codeString = "$event$WCIF_DELIMITER$specifier"

            return ActivityCode(codeString)
        }

        override fun encodeInstance(instance: ActivityCode) = instance.activityCodeString
        override fun makeInstance(deserialized: String) = ActivityCode(deserialized)
    }
}
