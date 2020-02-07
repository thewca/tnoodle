package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable
import java.time.ZoneId
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFParser.parseWCIFDateWithTimezone

@Serializable
data class Activity(val id: Int, val activityCode: ActivityCode, val startTime: String, val childActivities: List<Activity> = emptyList(), val scrambleSetId: Int? = null) {
    val nestedChildActivities: List<Activity>
        get() = childActivities.takeUnless { it.isEmpty() }
            ?.flatMap { it.nestedChildActivities }
            ?: listOf(this)

    fun getLocalStartTime(timeZone: ZoneId) = startTime.parseWCIFDateWithTimezone(timeZone)
}
