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

    fun findScrambleSet(wcif: Competition): ScrambleSet? {
        return wcif.events.asSequence()
            .flatMap { it.rounds.asSequence() }
            .flatMap { it.scrambleSets.asSequence() }
            .find { it.id == scrambleSetId } // FIXME WCIF if only one attempt specified, then only draw one scr (singleton list)
    }

    fun getLocalStartTime(timeZone: ZoneId) = startTime.parseWCIFDateWithTimezone(timeZone)
}
