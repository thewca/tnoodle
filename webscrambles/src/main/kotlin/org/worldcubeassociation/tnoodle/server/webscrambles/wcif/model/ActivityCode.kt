package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.*
import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.serial.SingletonStringEncoder
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.exceptions.TranslationException
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.provider.EventIdProvider
import java.util.*
import kotlin.math.*

@Serializable
data class ActivityCode(val activityCodeString: String) : EventIdProvider {
    @Transient
    private val activityParts = activityCodeString.split(WCIF_DELIMITER)

    @Transient
    private val structureParts = activityParts
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

    fun compileTitleString(locale: Locale, includeEvent: Boolean = true, includeGroupID: Boolean = true): String {
        val parts = structureParts.mapNotNull { (k, v) ->
            getPrefixTranslation(locale, k, v).trim()
                .takeUnless { k == WCIF_PREFIX_GROUP && !includeGroupID }
        }.filterNot { it.isEmpty() }.joinToString(TRANSLATION_DELIMITER)

        if (!includeEvent) {
            return parts
        }

        val prefix = eventModel?.description
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

        val PREFIX_TRANSLATION_KEYS = mapOf(
            WCIF_PREFIX_ROUND to "round",
            WCIF_PREFIX_GROUP to "Scramble Set", // FIXME Hack. Better idea how to handle!
            WCIF_PREFIX_ATTEMPT to "attempt"
        )

        const val TRANSLATION_DELIMITER = " "

        private fun getPrefixTranslation(locale: Locale, prefix: Char, value: String): String {
            val prefixKey = PREFIX_TRANSLATION_KEYS[prefix]
                ?: TranslationException.error("Untranslatable ActivityCode prefix: $prefix")

            if (prefix == WCIF_PREFIX_GROUP) {
                val convertedLetter = value.toIntOrNull()?.toColumnIndexString()
                return "$prefixKey $convertedLetter"
            }

            val translatedKey = Translate.translate("fmc.$prefixKey", locale)
            return "$translatedKey $value"
        }

        fun Int.toColumnIndexString(): String {
            val iterLength = max(1, ceil(log(this.toFloat(), 26f)).roundToInt())

            return List(iterLength) {
                '@' + ((this / 26f.pow(it).toInt()) % 26)
            }.joinToString("").reversed()
        }

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
