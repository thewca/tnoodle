package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import net.lingala.zip4j.io.ZipOutputStream
import net.lingala.zip4j.model.ZipParameters
import org.joda.time.DateTime
import org.joda.time.Days
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFHelper.Companion.filterForActivity
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest.Companion.putFileEntry

import java.util.Date

object OrderedScrambles {
    // TODO see https://github.com/thewca/tnoodle/issues/400

    fun generateOrderedScrambles(scrambleRequests: List<ScrambleRequest>, globalTitle: String?, generationDate: Date, zipOut: ZipOutputStream, parameters: ZipParameters, wcifHelper: WCIFHelper) {
        var hasMultipleDays = wcifHelper.hasMultipleDays
        val hasMultipleVenues = wcifHelper.hasMultipleVenues

        // We consider the competition start date as the earlier activity from the schedule.
        // This prevents miscalculation of dates for multiple timezones.
        val competitionStartString = wcifHelper.earliestActivityString

        for (venue in wcifHelper.venues) {
            val venueName = venue.fileSafeName

            val timezone = venue.dateTimeZone
            val competitionStartDate = DateTime(competitionStartString, timezone)

            for (room in venue.rooms) {
                val roomName = room.fileSafeName

                val requestsPerDay = room.activities
                    .flatMap { scrambleRequests.filterForActivity(it, timezone) }
                    .groupBy { Days.daysBetween(competitionStartDate.withTimeAtStartOfDay(), it.roundStartTime!!.withTimeAtStartOfDay()).days + 1 }

                // hasMultipleDays gets a variable assigned on the competition creation using the website's form.
                // Online schedule fit to it and the user should not be able to put events outside it, but we double check here.
                // The next assignment fix possible mistakes (eg. a competition is assigned with 1 day, but events are spread among 2 days).
                hasMultipleDays = hasMultipleDays || requestsPerDay.size > 1

                for ((day, scrambles) in requestsPerDay) {
                    if (scrambles.isNotEmpty()) {
                        val parts = listOfNotNull(
                            "Printing/Ordered Scrambles/",
                            "$venueName/".takeIf { hasMultipleVenues },
                            "Day $day/".takeIf { hasMultipleDays },
                            "Ordered Scrambles",
                            " - $venueName".takeIf { hasMultipleVenues },
                            " - Day $day".takeIf { hasMultipleDays },
                            " - $roomName".takeIf { venue.hasMultipleRooms },
                            ".pdf"
                        )

                        // In addition to different folders, we stamp venue, day and room in the PDF's name
                        // to prevent different files with the same name.
                        val pdfFileName = parts.joinToString("")

                        val sheet = ScrambleRequest.requestsToCompletePdf(globalTitle, generationDate, scrambles.sorted(), null)
                        zipOut.putFileEntry(pdfFileName, sheet.render(), parameters)
                    }
                }
            }
        }
    }
}
