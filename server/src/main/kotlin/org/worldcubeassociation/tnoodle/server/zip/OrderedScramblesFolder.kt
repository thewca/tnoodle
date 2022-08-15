package org.worldcubeassociation.tnoodle.server.zip

import org.worldcubeassociation.tnoodle.server.exception.ScheduleMatchingException
import org.worldcubeassociation.tnoodle.server.pdf.ScrambleSheet
import org.worldcubeassociation.tnoodle.server.wcif.WCIFDataBuilder
import org.worldcubeassociation.tnoodle.core.model.wcif.Schedule
import org.worldcubeassociation.tnoodle.core.model.zip.Folder
import org.worldcubeassociation.tnoodle.core.model.zip.dsl.folder
import org.worldcubeassociation.tnoodle.server.zip.util.FileStringUtil.toFileSafeString
import java.time.Period
import java.time.ZonedDateTime

data class OrderedScramblesFolder(val globalTitle: String, val scrambleSheets: List<ScrambleSheet>) {
    fun assemble(wcifSchedule: Schedule, pdfPassword: String?): Folder {
        val wcifBindings = wcifSchedule.allActivities
            // scrambleSetId as assigned by WCIFScrambleMatcher#matchActivity
            .filter { it.scrambleSetId != null }
            .associateWith { act ->
                scrambleSheets.filter { it.scrambleSetId == act.scrambleSetId }.unlessEmpty()
                    ?: ScheduleMatchingException.error("Ordered Scrambles: Could not find ScrambleSet ${act.scrambleSetId} associated with Activity $act")
            }.mapValues { (act, scrs) ->
                scrs.filter { act.activityCode.isParentOf(it.activityCode) }.unlessEmpty()
                    ?: ScheduleMatchingException.error("Ordered Scrambles: Could not find any activity for scramble sheets affiliated with ScrambleSet ${act.scrambleSetId}")
            }

        val activityDays = wcifSchedule.activitiesWithLocalStartTimes
            .map { it.value.dayOfYear }
            .distinct()

        // hasMultipleDays gets a variable assigned on the competition creation using the website's form.
        // Online schedule fit to it and the user should not be able to put events outside it, but we double check here.
        // The next assignment fix possible mistakes (eg. a competition is assigned with 1 day, but events are spread among 2 days).
        val hasMultipleDays = wcifSchedule.hasMultipleDays || activityDays.size > 1
        val hasMultipleVenues = wcifSchedule.hasMultipleVenues

        // We consider the competition start date as the earlier activity from the schedule.
        // This prevents miscalculation of dates for multiple timezones.
        val competitionStartActivity = wcifSchedule.activitiesWithLocalStartTimes
            .minByOrNull { it.value }?.key
            ?: ScheduleMatchingException.error("Unable to compute earliest activity")

        return folder("Ordered Scrambles") {
            for (venue in wcifSchedule.venues) {
                val venueName = venue.safeName.toFileSafeString()
                val hasMultipleRooms = venue.hasMultipleRooms

                val timezone = venue.dateTimeZone
                val competitionStartDate = competitionStartActivity.getLocalStartTime(timezone)

                for (room in venue.rooms) {
                    val roomName = room.safeName.toFileSafeString()

                    val activitiesPerDay = room.activities
                        .flatMap { it.leafChildActivities }
                        .groupBy {
                            Period.between(
                                competitionStartDate.atLocalStartOfDay(),
                                it.getLocalStartTime(timezone).atLocalStartOfDay()
                            ).days
                        }

                    for ((nthDay, activities) in activitiesPerDay) {
                        val scrambles = activities.associateWith(wcifBindings::get)
                            .filterValuesNotNull()

                        val activitiesHaveScrambles = scrambles.values.flatten().isNotEmpty()

                        if (activitiesHaveScrambles) {
                            val filenameDay = nthDay + 1

                            val parts = listOfNotNull(
                                "$venueName/".takeIf { hasMultipleVenues },
                                "Day $filenameDay/".takeIf { hasMultipleDays },
                                "Ordered Scrambles",
                                " - $venueName".takeIf { hasMultipleVenues },
                                " - Day $filenameDay".takeIf { hasMultipleDays },
                                " - $roomName".takeIf { hasMultipleRooms },
                                ".pdf"
                            )

                            if (hasMultipleVenues || hasMultipleDays || hasMultipleRooms) {
                                // In addition to different folders, we stamp venue, day and room in the PDF's name
                                // to prevent different files with the same name.
                                val pdfFileName = parts.joinToString("")

                                val sortedScrambles = scrambles.entries
                                    .sortedBy { it.key.getLocalStartTime(timezone) }
                                    .flatMap { it.value }

                                val sheet = WCIFDataBuilder.compileOutlinePdf(sortedScrambles, pdfPassword)
                                file(pdfFileName, sheet)
                            }
                        }
                    }
                }
            }

            // Generate all scrambles ordered
            val allScramblesOrdered = wcifSchedule.activitiesWithLocalStartTimes.entries
                .sortedBy { it.value }
                // the notNull will effectively never happen, because we guarantee that all relevant activities are indexed
                .mapNotNull { wcifBindings[it.key] }
                .flatten()
                .distinct()

            val completeOrderedPdf = WCIFDataBuilder.compileOutlinePdf(allScramblesOrdered, pdfPassword)

            val safeGlobalTitle = globalTitle.toFileSafeString()
            file("Ordered $safeGlobalTitle - All Scrambles.pdf", completeOrderedPdf)
        }
    }

    companion object {
        fun ZonedDateTime.atLocalStartOfDay() = toLocalDate().atStartOfDay(zone).toLocalDate()

        fun <K, V> Map<K, V?>.filterValuesNotNull(): Map<K, V> = mapNotNull { (k, v) -> v?.let { k to it } }.toMap()
        fun <T, C : Collection<T>> C.unlessEmpty(): C? = takeIf { it.isNotEmpty() }
    }
}
