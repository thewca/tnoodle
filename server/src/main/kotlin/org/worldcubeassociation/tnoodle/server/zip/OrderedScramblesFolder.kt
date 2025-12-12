package org.worldcubeassociation.tnoodle.server.zip

import org.worldcubeassociation.tnoodle.server.exceptions.ScheduleMatchingException
import org.worldcubeassociation.tnoodle.server.pdf.ScrambleSheet
import org.worldcubeassociation.tnoodle.server.zip.util.StringUtil.toFileSafeString
import org.worldcubeassociation.tnoodle.server.wcif.WCIFDataBuilder
import org.worldcubeassociation.tnoodle.server.wcif.model.Schedule
import org.worldcubeassociation.tnoodle.server.zip.model.Folder
import org.worldcubeassociation.tnoodle.server.zip.model.dsl.folder
import java.time.Period
import java.time.ZonedDateTime

data class OrderedScramblesFolder(val globalTitle: String, val scrambleSheets: List<ScrambleSheet>) {
    fun assemble(wcifSchedule: Schedule, pdfPassword: String?): Folder {
        val allActivityCoordinates = wcifSchedule.activityCoordinates { selfAndChildActivities }

        val wcifBindings = allActivityCoordinates
            // scrambleSetId as assigned by WCIFScrambleMatcher#matchActivity
            .filter { it.activity.scrambleSetId != null }
            .associateWith { coord ->
                scrambleSheets.filter { it.scrambleSetId == coord.activity.scrambleSetId }.unlessEmpty()
                    ?: ScheduleMatchingException.error("Ordered Scrambles: Could not find ScrambleSet ${coord.activity.scrambleSetId} associated with Activity ${coord.activity}")
            }.mapValues { (coord, sheets) ->
                sheets.filter { coord.activity.activityCode.isParentOf(it.activityCode) }.unlessEmpty()
                    ?: ScheduleMatchingException.error("Ordered Scrambles: Could not find any activity for scramble sheets affiliated with ScrambleSet ${coord.activity.scrambleSetId}")
            }.mapKeys { it.key.activity }

        val activityDays = allActivityCoordinates
            .map { it.localStartTime.dayOfYear }
            .distinct()

        // hasMultipleDays gets a variable assigned on the competition creation using the website's form.
        // Online schedule fit to it and the user should not be able to put events outside it, but we double-check here.
        // The next assignment fix possible mistakes (e.g. a competition is assigned with 1 day, but events are spread among 2 days).
        val hasMultipleDays = wcifSchedule.hasMultipleDays || activityDays.size > 1
        val hasMultipleVenues = wcifSchedule.hasMultipleVenues

        // We consider the competition start date as the earlier activity from the schedule.
        // This prevents miscalculation of dates for multiple timezones.
        val competitionStartActivity = allActivityCoordinates.minBy { it.localStartTime }.activity
        val leafActivityCoordinates = wcifSchedule.activityCoordinates { leafChildActivities }

        val matchingFilenames = leafActivityCoordinates.groupBy { coord ->
            val (venue, room, activity) = coord

            val venueName = venue.fileSafeName
            val hasMultipleRooms = venue.hasMultipleRooms

            val timezone = venue.dateTimeZone
            val competitionStartDate = competitionStartActivity.getLocalStartTime(timezone)

            val roomName = room.fileSafeName

            val nthDay = Period.between(
                competitionStartDate.atLocalStartOfDay(),
                activity.getLocalStartTime(timezone).atLocalStartOfDay(),
            ).days

            // The distance between the competition start date and this activity's start date may be 0.
            //   This means that the activity is happening on the same day as the competition start,
            //   which should be rendered to humans as "Day 1".
            val filenameDay = nthDay + 1

            // The folder structure is only grouped by venue and day.
            //   The WCIF schedule logic implies venue -> room -> day, but in reality,
            //   printed scramble sheets are often managed centrally per venue.
            // So we include the room information only in the filename.
            val folderParts = listOfNotNull(
                "$venueName/".takeIf { hasMultipleVenues },
                "Day $filenameDay/".takeIf { hasMultipleDays },
            )

            // We stamp all relevant information into the filename again,
            //   to prevent accidental duplicate names. The "worst" possible case is:
            //   1 venue, 1 day, 1 room. In which case, there will only be one file anyway.
            val fileParts = listOfNotNull(
                "Ordered Scrambles",
                " - $venueName".takeIf { hasMultipleVenues },
                " - Day $filenameDay".takeIf { hasMultipleDays },
                " - $roomName".takeIf { hasMultipleRooms },
                ".pdf"
            )

            val parts = folderParts + fileParts
            parts.joinToString("")
        }

        return folder("Ordered Scrambles") {
            for ((pdfFileName, activityCoords) in matchingFilenames) {
                val sortedScrambles = activityCoords
                    .sortedBy { it.localStartTime }
                    .mapNotNull { wcifBindings[it.activity] }
                    .flatten()
                    .distinct()

                val sheet = WCIFDataBuilder.compileOutlinePdf(sortedScrambles, pdfPassword)
                file(pdfFileName, sheet)
            }

            // Generate all scrambles ordered
            val allScramblesOrdered = leafActivityCoordinates
                .sortedBy { it.localStartTime }
                // the notNull will effectively never happen, because we guarantee that all relevant activities are indexed
                .mapNotNull { wcifBindings[it.activity] }
                .flatten()
                .distinct()

            val completeOrderedPdf = WCIFDataBuilder.compileOutlinePdf(allScramblesOrdered, pdfPassword)

            val safeGlobalTitle = globalTitle.toFileSafeString()
            file("$safeGlobalTitle - Ordered Scrambles.pdf", completeOrderedPdf)
        }
    }

    companion object {
        fun ZonedDateTime.atLocalStartOfDay() = toLocalDate().atStartOfDay(zone).toLocalDate()

        fun <T, C : Collection<T>> C.unlessEmpty(): C? = takeIf { it.isNotEmpty() }
    }
}
