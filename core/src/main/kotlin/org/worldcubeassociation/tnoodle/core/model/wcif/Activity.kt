package org.worldcubeassociation.tnoodle.core.model.wcif

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.core.model.wcif.provider.IndexingIdProvider
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

@Serializable
data class Activity(
    override val id: Int,
    val activityCode: @Serializable(with = ActivityCode.Companion::class) ActivityCode,
    val startTime: String,
    val childActivities: List<Activity> = emptyList(),
    val scrambleSetId: Int? = null
) : IndexingIdProvider {
    val leafChildActivities: List<Activity>
        get() = childActivities.takeUnless { it.isEmpty() }
            ?.flatMap { it.leafChildActivities }
            ?: listOf(this)

    val selfAndChildActivities: List<Activity>
        get() = listOf(this) + childActivities.flatMap { it.selfAndChildActivities }

    fun getLocalStartTime(timeZone: ZoneId) = startTime.parseWCIFDateWithTimezone(timeZone)

    companion object {
        val WCIF_DATE_FORMAT = DateTimeFormatter.ISO_OFFSET_DATE_TIME

        fun String.parseWCIFDateWithTimezone(timeZone: ZoneId) = ZonedDateTime.parse(this, WCIF_DATE_FORMAT)
            .withZoneSameInstant(timeZone)
    }
}
