package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.google.gson.JsonParser
import org.joda.time.DateTime
import org.joda.time.DateTimeZone
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.StringUtil.toFileSafeString

import java.util.ArrayList
import java.util.Arrays

class WCIFHelper(schedule: String?, val allScrambleRequests: List<ScrambleRequest>) {
    private val parser = JsonParser()
    val schedule = schedule?.takeIf { it.isNotBlank() }?.let { parser.parse(it)?.asJsonObject }

    val venues: JsonArray
        get() = schedule?.getAsJsonArray("venues") ?: JsonArray()

    val earlierActivityString: String?
        get() {
            var date: DateTime? = null
            var out: String? = null
            for (venue in venues) {
                for (room in getRooms(venue)) {
                    for (activity in getActivities(room)) {
                        val startTime = getActivityStartTime(activity)
                        val tempDate = DateTime.parse(startTime)
                        if (date == null || tempDate.isBefore(date)) {
                            date = tempDate
                            out = startTime
                        }
                    }
                }
            }
            assert(out != null) { "I could not find the earlier activity." }
            return out
        }

    fun hasMultipleDays(): Boolean {
        return schedule != null && schedule.get("numberOfDays").asInt > 1
    }

    fun hasMultipleVenues(): Boolean {
        return schedule != null && schedule.getAsJsonArray("venues").size() > 1
    }

    fun getRooms(venue: JsonElement): JsonArray {
        return venue.asJsonObject.getAsJsonArray("rooms")
    }

    fun getActivities(room: JsonElement): JsonArray {
        return room.asJsonObject.getAsJsonArray("activities")
    }

    fun getActivityStartTime(activity: JsonElement): String {
        return activity.asJsonObject.get("startTime").asString
    }

    fun getSafeVenueName(venue: JsonElement): String {
        return toFileSafeString(parseMarkdown(venue.asJsonObject.get("name").asString))
    }

    fun hasMultipleRooms(venue: JsonElement): Boolean {
        return venue.asJsonObject.getAsJsonArray("rooms").size() > 1
    }

    fun getSafeRoomName(room: JsonElement): String {
        return toFileSafeString(parseMarkdown(room.asJsonObject.get("name").asString))
    }

    fun getActivityCode(activity: JsonElement): String {
        return activity.asJsonObject.get("activityCode").asString
    }

    // In case venue or room is using markdown
    private fun parseMarkdown(s: String): String {
        if (s.indexOf('[') >= 0 && s.indexOf(']') >= 0) {
            return s.substring(s.indexOf('[') + 1, s.indexOf(']'))
        }

        return s
    }

    fun getActivityStartTime(activity: JsonElement, timezone: DateTimeZone): DateTime {
        return DateTime(activity.asJsonObject.get("startTime").asString, timezone)
    }

    fun getTimeZone(venue: JsonElement): DateTimeZone {
        return DateTimeZone.forID(venue.asJsonObject.get("timezone").asString)
    }

    fun getScrambleRequests(activityCode: String): ArrayList<ScrambleRequest> {
        var scrambleRequests = ArrayList<ScrambleRequest>()

        var round = 0
        var group = 0
        var attempt = 0

        val activitySplit = activityCode.split("-".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
        val event = activitySplit[0]

        if (Arrays.asList(*wcifIgnorableKeys).indexOf(event) >= 0) {
            return scrambleRequests
        }

        // This part assumes every round, group and attempt is labeled with an integer from competitionJson
        for (item in activityCode.split("-".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()) {
            if (item[0] == 'r') {
                round = Integer.parseInt(item.substring(1))
            } else if (item[0] == 'g') {
                group = Integer.parseInt(item.substring(1))
            } else if (item[0] == 'a') {
                attempt = Integer.parseInt(item.substring(1))
            }
        }

        // First, we add all requests whose events equals what we need
        for (item in allScrambleRequests) {
            if (item.event == event) {
                scrambleRequests.add(item)
            }
        }

        // Then, we start removing, iterating over a copy, removing from original.
        if (round > 0) {
            for (scrambleRequest in ArrayList(scrambleRequests)) {
                if (scrambleRequest.round != round) {
                    scrambleRequests.remove(scrambleRequest)
                }
            }
        }

        if (group > 0) {
            for (scrambleRequest in ArrayList(scrambleRequests)) {
                if (!compareLettersCharToNumber(scrambleRequest.group!!, group)) {
                    scrambleRequests.remove(scrambleRequest)
                }
            }
        }

        if (attempt > 0) {
            val temp = ArrayList<ScrambleRequest>()
            for (scrambleRequest in scrambleRequests) {
                val attemptRequest = scrambleRequest.copy(
                    scrambles = listOf(scrambleRequest.scrambles[attempt - 1]),
                    attempt = attempt,
                    totalAttempt = scrambleRequest.scrambles.size // useful for fmc
                )

                temp.add(attemptRequest)
            }
            scrambleRequests = ArrayList(temp)
        }

        assert(scrambleRequests.isNotEmpty()) { "An activity of the schedule did not match an event." }

        return scrambleRequests
    }

    private fun compareLettersCharToNumber(letters: String, number: Int): Boolean {
        var sum = 0
        var pow = 1
        for (i in letters.length - 1 downTo 0) {
            sum += (letters[i] - 'A' + 1) * pow
            pow *= 26
        }
        return sum == number
    }

    companion object {

        // Currently, we mark not cubing related activities as other-lunch or other-speech, for example.
        // If we ever accept any other such ignorable key, it should be added here.
        private val wcifIgnorableKeys = arrayOf("other")
    }
}
