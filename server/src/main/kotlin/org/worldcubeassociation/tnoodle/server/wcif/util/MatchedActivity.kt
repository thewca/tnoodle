package org.worldcubeassociation.tnoodle.server.wcif.util

import org.worldcubeassociation.tnoodle.server.pdf.ScrambleSheet
import org.worldcubeassociation.tnoodle.server.wcif.model.Schedule
import java.time.Period
import java.time.ZonedDateTime

data class MatchedActivity(
    val coordinate: ActivityCoordinate,
    val scrambleSheets: List<ScrambleSheet>,
) {
    val venue get() = this.coordinate.venue
    val room get() = this.coordinate.room
    val activity get() = this.coordinate.activity
    val localStartTime get() = this.coordinate.localStartTime

    fun computeFileIdentifier(crossMatchedActivities: List<MatchedActivity>): Pair<List<String>, List<String>> {
        val venueName = this.venue.fileSafeName
        val roomName = this.room.fileSafeName

        val hasMultipleDays = crossMatchedActivities.distinctBy { it.localStartTime.dayOfYear }.size > 1
        val hasMultipleVenues = crossMatchedActivities.distinctBy { it.venue }.size > 1

        val competitionStartActivity = crossMatchedActivities.minBy { it.localStartTime }.activity
        val competitionStartDate = competitionStartActivity.getLocalStartTime(this.venue.dateTimeZone)

        val nthDay = Period.between(
            competitionStartDate.atLocalStartOfDay(),
            this.localStartTime.atLocalStartOfDay(),
        ).days

        // The distance between the competition start date and this activity's start date may be 0.
        //   This means that the activity is happening on the same day as the competition start,
        //   which should be rendered to humans as "Day 1".
        val dayInFilename = nthDay + 1

        // The folder structure is only grouped by venue and day.
        //   The WCIF schedule logic implies venue -> room -> day, but in reality,
        //   printed scramble sheets are often managed centrally per venue.
        // So we include the room information only in the filename.
        val folderParts = listOfNotNull(
            venueName.takeIf { hasMultipleVenues },
            "Day $dayInFilename".takeIf { hasMultipleDays },
        )

        // We need to check the "multiple rooms" property not with respect to all activities
        //   of the whole competition, but only with respect to the current room's venue.
        val hasMultipleRooms = crossMatchedActivities
            .filter { it.venue === this.venue }
            .distinctBy { it.room }
            .size > 1

        // We stamp all relevant information into the filename again,
        //   to prevent accidental duplicate names. The "worst" possible case is:
        //   1 venue, 1 day, 1 room. In which case, there will only be one file anyway.
        val fileParts = listOfNotNull(
            *folderParts.toTypedArray(),
            roomName.takeIf { hasMultipleRooms },
        )

        return folderParts to fileParts
    }

    companion object {
        val List<MatchedActivity>.orderedScrambleSheets
            get() = this
                .sortedBy { it.localStartTime }
                .flatMap { it.scrambleSheets }

        fun ZonedDateTime.atLocalStartOfDay() = toLocalDate().atStartOfDay(zone).toLocalDate()

        fun matchActivities(wcifSchedule: Schedule, scrambleSheets: List<ScrambleSheet>): List<MatchedActivity> {
            return wcifSchedule.activityCoordinates { this.leafChildActivities }
                // Only consider activities which were matched by WCIFScrambleMatcher#matchActivity
                .filter { it.activity.scrambleSetId != null }
                .mapNotNull { coord ->
                    val matchedScrambleSheets = scrambleSheets
                        .filter { it.scrambleSetId == coord.activity.scrambleSetId }
                        .filter { coord.activity.activityCode.isParentOf(it.activityCode) }
                        .takeUnless { it.isEmpty() } ?: return@mapNotNull null

                    MatchedActivity(coord, matchedScrambleSheets)
                }
        }
    }
}
