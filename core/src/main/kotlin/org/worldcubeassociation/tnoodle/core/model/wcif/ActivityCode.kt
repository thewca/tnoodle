package org.worldcubeassociation.tnoodle.core.model.wcif

import kotlinx.serialization.*
import org.worldcubeassociation.tnoodle.core.model.scramble.EventData
import org.worldcubeassociation.tnoodle.core.model.wcif.provider.EventIdProvider
import org.worldcubeassociation.tnoodle.core.serial.SingletonStringEncoder

@Serializable
data class ActivityCode(val activityCodeString: String) : EventIdProvider {
    @Transient
    private val activityParts = activityCodeString.split(WCIF_DELIMITER)

    @Transient
    val structureParts = activityParts
        .drop(1) // drop eventId prefix
        .associateBy { it.first() }
        .mapValues { it.value.drop(1) }

    override val eventId: String
        get() = activityParts.first()

    val roundNumber: Int?
        get() = intPart(WCIF_PREFIX_ROUND)

    val groupNumber: Int?
        get() = intPart(WCIF_PREFIX_GROUP)

    val attemptNumber: Int?
        get() = intPart(WCIF_PREFIX_ATTEMPT)

    private fun intPart(prefix: Char): Int? = structureParts[prefix]?.toIntOrNull()?.minus(1)

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

        const val TRANSLATION_DELIMITER = " "

        fun compile(event: String, round: Int? = null, group: Int? = null, attempt: Int? = null): ActivityCode {
            val sections = listOfNotNull(
                round?.let { WCIF_PREFIX_ROUND to it },
                group?.let { WCIF_PREFIX_GROUP to it },
                attempt?.let { WCIF_PREFIX_ATTEMPT to it }
            ).toMap()

            val parts = sections.mapValues { it.value + 1 }

            val specifier = parts.entries.joinToString(WCIF_DELIMITER) { (k, v) -> "$k$v" }
            val codeString = "$event$WCIF_DELIMITER$specifier"

            return ActivityCode(codeString)
        }

        fun compile(event: EventData, round: Int? = null, group: Int? = null, attempt: Int? = null) =
            compile(event.key, round, group, attempt)

        override fun encodeInstance(instance: ActivityCode) = instance.activityCodeString
        override fun makeInstance(deserialized: String) = ActivityCode(deserialized)
    }
}
