package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable
import java.time.ZoneId
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFParser.parseWCIFDateWithTimezone

@Serializable
data class Activity(val id: Int, val activityCode: @Serializable(with = ActivityCode.Companion::class) ActivityCode, val startTime: String, val childActivities: List<Activity> = emptyList(), val scrambleSetId: Int? = null) {
    val leafChildActivities: List<Activity>
        get() = childActivities.takeUnless { it.isEmpty() }
            ?.flatMap { it.leafChildActivities }
            ?: listOf(this)

    val selfAndChildActivities: List<Activity>
        get() = listOf(this) + childActivities.flatMap { it.selfAndChildActivities }

    fun getLocalStartTime(timeZone: ZoneId) = startTime.parseWCIFDateWithTimezone(timeZone)
}
