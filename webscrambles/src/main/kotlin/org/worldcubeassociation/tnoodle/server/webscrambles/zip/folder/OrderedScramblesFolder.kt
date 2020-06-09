package org.worldcubeassociation.tnoodle.server.webscrambles.zip.folder

import org.worldcubeassociation.tnoodle.server.webscrambles.exceptions.ScheduleMatchingException
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.StringUtil.toFileSafeString
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.CompetitionDrawingData
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFDataBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Schedule
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.folder
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.Folder
import java.time.LocalDate
import java.time.Period
import java.time.ZonedDateTime

data class OrderedScramblesFolder(val globalTitle: String, val scrambleDrawingData: CompetitionDrawingData) {
    fun assemble(wcifSchedule: Schedule, generationDate: LocalDate, versionTag: String): Folder {
        val wcifBindings = wcifSchedule.allActivities
            // scrambleSetId as assigned by WCIFScrambleMatcher#matchActivity
            .filter { it.scrambleSetId != null }
            .associateWith { ac ->
                scrambleDrawingData.scrambleSheets.find { it.scrambleSet.id == ac.scrambleSetId }
                    ?: ScheduleMatchingException.error("Ordered Scrambles: Could not find ScrambleSet ${ac.scrambleSetId} associated with Activity $ac")
            }.mapValues { (act, scr) ->
                act.activityCode.attemptNumber?.let(scr::copyForAttempt) ?: scr
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
        val competitionStartActivity = wcifSchedule.earliestActivity

        return folder("Ordered Scrambles") {
            for (venue in wcifSchedule.venues) {
                val venueName = venue.fileSafeName
                val hasMultipleRooms = venue.hasMultipleRooms

                val timezone = venue.dateTimeZone
                val competitionStartDate = competitionStartActivity.getLocalStartTime(timezone)

                for (room in venue.rooms) {
                    val roomName = room.fileSafeName

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

                        val activitiesHaveScrambles = scrambles.values.isNotEmpty()

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
                                    .map { it.value }

                                val sheetData = scrambleDrawingData.copy(scrambleSheets = sortedScrambles)
                                val sheet = WCIFDataBuilder.requestsToCompletePdf(sheetData, generationDate, versionTag)

                                file(pdfFileName, sheet.render())
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
                .distinct()

            val allScramblesData = scrambleDrawingData.copy(scrambleSheets = allScramblesOrdered)
            val completeOrderedPdf = WCIFDataBuilder.requestsToCompletePdf(allScramblesData, generationDate, versionTag)

            val safeGlobalTitle = globalTitle.toFileSafeString()
            file("Ordered $safeGlobalTitle - All Scrambles.pdf", completeOrderedPdf.render())
        }
    }

    companion object {
        fun ZonedDateTime.atLocalStartOfDay() = toLocalDate().atStartOfDay(zone).toLocalDate()

        fun <K, V> Map<K, V?>.filterValuesNotNull(): Map<K, V> = mapNotNull { (k, v) -> v?.let { k to it } }.toMap()
    }
}
