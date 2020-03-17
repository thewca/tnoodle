package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.*
import org.worldcubeassociation.tnoodle.server.plugins.EventPlugins
import org.worldcubeassociation.tnoodle.server.serial.SingletonStringEncoder
import kotlin.math.*

@Serializable
data class ActivityCode(val activityCodeString: String) {
    @Transient
    private val activityParts = activityCodeString.split(WCIF_DELIMITER)

    val eventId: String
        get() = activityParts.first()

    val eventPlugin: EventPlugins?
        get() = EventPlugins.WCA_EVENTS[eventId]

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

    fun compileTitleString(includeEvent: Boolean = true): String {
        val parts = structureParts.map { (k, v) ->
            val translatePrefix = PREFIX_TRANSLATIONS[k]
            val translateValue = v.takeUnless { k == WCIF_PREFIX_GROUP }
                ?: v.toIntOrNull()?.toColumnIndexString()

            "$translatePrefix $translateValue"
        }.joinToString(TRANSLATION_DELIMITER)

        if (!includeEvent) {
            return parts
        }

        val prefix = Event.getEventName(eventId)
        return "$prefix $parts"
    }

    companion object : SingletonStringEncoder<ActivityCode>("ActivityCode") {
        // Currently, we mark not cubing related activities as other-lunch or other-speech, for example.
        // If we ever accept any other such ignorable key, it should be added here.
        val IGNORABLE_KEYS = listOf("other")

        const val WCIF_DELIMITER = "-"

        const val WCIF_PREFIX_ROUND = 'r'
        const val WCIF_PREFIX_GROUP = 'g'
        const val WCIF_PREFIX_ATTEMPT = 'a'

        // TODO i18n
        val PREFIX_TRANSLATIONS = mapOf(
            WCIF_PREFIX_ROUND to "Round",
            WCIF_PREFIX_GROUP to "Scramble Set", // FIXME I feel this is cheating. Better idea how to handle!
            WCIF_PREFIX_ATTEMPT to "Attempt"
        )

        const val TRANSLATION_DELIMITER = " "

        fun Int.toColumnIndexString(): String {
            val iterLength = max(1, ceil(log(this.toFloat(), 26f)).roundToInt())

            return List(iterLength) {
                'A' + ((this / 26f.pow(it).toInt()) % 26)
            }.joinToString("").reversed()
        }

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

        fun compile(event: EventPlugins, round: Int? = null, group: Int? = null, attempt: Int? = null) =
            compile(event.key, round, group, attempt)

        override fun encodeInstance(instance: ActivityCode) = instance.activityCodeString
        override fun makeInstance(deserialized: String) = ActivityCode(deserialized)
    }
}
