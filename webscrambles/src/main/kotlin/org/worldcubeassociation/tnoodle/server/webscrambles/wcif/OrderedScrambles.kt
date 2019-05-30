package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import net.lingala.zip4j.io.ZipOutputStream
import net.lingala.zip4j.model.ZipParameters
import org.joda.time.DateTime
import org.joda.time.Days
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest

import java.util.ArrayList
import java.util.Date

object OrderedScrambles {
    // TODO see https://github.com/thewca/tnoodle/issues/400

    fun generateOrderedScrambles(globalTitle: String?, generationDate: Date, zipOut: ZipOutputStream, parameters: ZipParameters, wcifHelper: WCIFHelper) {
        if (wcifHelper.schedule == null) {
            return
        }

        assert(wcifHelper.allScrambleRequests != null) { "There should be scramble requests." }

        var hasMultipleDays = wcifHelper.hasMultipleDays()
        val hasMultipleVenues = wcifHelper.hasMultipleVenues()

        // We consider the competition start date as the earlier activity from the schedule.
        // This prevents miscalculation of dates for multiple timezones.
        val competitionStartString = wcifHelper.earlierActivityString

        for (venue in wcifHelper.venues) {
            val venueName = wcifHelper.getSafeVenueName(venue)

            val timezone = wcifHelper.getTimeZone(venue)
            val competitionStartDate = DateTime(competitionStartString, timezone)

            val hasMultipleRooms = wcifHelper.hasMultipleRooms(venue)

            for (room in wcifHelper.getRooms(venue)) {

                val dayList = ArrayList<Int>()
                val scrambleRequestListByDay = ArrayList<ArrayList<ScrambleRequest>>()

                val roomName = wcifHelper.getSafeRoomName(room)

                for (activity in wcifHelper.getActivities(room)) {
                    val activityCode = wcifHelper.getActivityCode(activity)

                    for (scrambleRequest in wcifHelper.getScrambleRequests(activityCode)) {

                        val activityStartTime = wcifHelper.getActivityStartTime(activity, timezone)

                        val activityDay = Days.daysBetween(competitionStartDate.withTimeAtStartOfDay(), activityStartTime.withTimeAtStartOfDay()).days + 1

                        if (!dayList.contains(activityDay)) {
                            dayList.add(activityDay)
                            scrambleRequestListByDay.add(ArrayList())
                        }

                        val index = dayList.indexOf(activityDay)
                        scrambleRequest.roundStartTime = activityStartTime
                        scrambleRequestListByDay[index].add(scrambleRequest)
                    }
                }

                // hasMultipleDays gets a variable assigned on the competition creation using the website's form.
                // Online schedule fit to it and the user should not be able to put events outside it, but we double check here.
                // The next assignment fix possible mistakes (eg. a competition is assigned with 1 day, but events are spread among 2 days).
                hasMultipleDays = hasMultipleDays || dayList.size > 1

                for (index in dayList.indices) {
                    if (scrambleRequestListByDay[index].size > 0) {

                        scrambleRequestListByDay[index].sort()

                        var pdfFileName = "Printing/Ordered Scrambles/"

                        if (hasMultipleVenues) {
                            pdfFileName += "$venueName/"
                        }

                        if (hasMultipleDays) {
                            pdfFileName += "Day " + dayList[index] + "/"
                        }

                        pdfFileName += "Ordered Scrambles"

                        // In addition to different folders, we stamp venue, day and room in the PDF's name
                        // to prevent different files with the same name.
                        if (hasMultipleVenues) {
                            pdfFileName += " - $venueName"
                        }

                        if (hasMultipleDays) {
                            pdfFileName += " - Day " + dayList[index]
                        }

                        if (hasMultipleRooms) {
                            pdfFileName += " - $roomName"
                        }
                        pdfFileName += ".pdf"

                        parameters.fileNameInZip = pdfFileName
                        zipOut.putNextEntry(null, parameters)
                        val scrambleRequests = scrambleRequestListByDay[index]
                        val baos = ScrambleRequest.requestsToPdf(globalTitle, generationDate, scrambleRequests, null)
                        zipOut.write(baos.toByteArray())
                        zipOut.closeEntry()
                    }
                }
            }
        }
    }
}
