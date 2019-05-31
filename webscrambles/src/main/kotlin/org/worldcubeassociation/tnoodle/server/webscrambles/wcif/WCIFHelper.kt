package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import com.google.gson.JsonArray
import com.google.gson.JsonParser
import org.joda.time.DateTime
import org.joda.time.DateTimeZone
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest

import kotlin.math.pow

class WCIFHelper(schedule: String) {
    val schedule = PARSER.parse(schedule)?.asJsonObject

    val venues: List<Venue>
    val numberOfDays: Int

    init {
        val parsedSchedule = PARSER.parse(schedule)?.asJsonObject

        val rawVenues = parsedSchedule?.getAsJsonArray("venues") ?: JsonArray()

        venues = rawVenues.map { it.asJsonObject }.map { jsonVenue ->
            val rawRooms = jsonVenue.getAsJsonArray("rooms") ?: JsonArray()

            val rooms = rawRooms.map { it.asJsonObject }.map { jsonRoom ->
                val rawActivities = jsonRoom.asJsonObject.getAsJsonArray("activities") ?: JsonArray()

                val activities = rawActivities.map { it.asJsonObject }.map { jsonActivity ->
                    Activity(jsonActivity.get("activityCode").asString, jsonActivity.get("startTime").asString)
                }

                Room(jsonRoom.get("name").asString, activities)
            }

            Venue(jsonVenue.get("name").asString, rooms, jsonVenue.get("timezone").asString)
        }

        numberOfDays = parsedSchedule?.get("numberOfDays")?.asInt ?: 0
    }

    val earliestActivityString: String
        get() = venues
            .flatMap { it.rooms }
            .flatMap { it.activities }
            .map { it.startTime }
            .maxBy { DateTime.parse(it) } ?: error("I could not find the earlier activity")

    val hasMultipleDays: Boolean get() = numberOfDays > 1
    val hasMultipleVenues: Boolean get() = venues.size > 1

    companion object {
        private val PARSER = JsonParser()

        fun List<ScrambleRequest>.filterForActivity(activity: Activity, timeZone: DateTimeZone): List<ScrambleRequest> {
            val activitySplit = activity.activityCode.split("-".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
            val event = activitySplit[0]

            if (WCIF_IGNORABLE_KEYS.contains(event)) {
                return emptyList()
            }

            var round = 0
            var group = 0
            var attempt = 0

            // This part assumes every round, group and attempt is labeled with an integer from competitionJson
            for (item in activitySplit) {
                when {
                    item[0] == 'r' -> round = item.substring(1).toInt()
                    item[0] == 'g' -> group = item.substring(1).toInt()
                    item[0] == 'a' -> attempt = item.substring(1).toInt()
                }
            }

            // First, we add all requests whose events equals what we need
            val matchingRequests = filter { it.event == event }
                // Then, we start removing, depending on the defined details.
                .filter { round > 0 && it.round != round }.toMutableList()
                .filter { group > 0 && compareLettersCharToNumber(it.group.orEmpty(), group) }

            val mappedRequests = matchingRequests.map { request ->
                attempt.takeIf { it > 0 }?.let {
                    request.copy(
                        scrambles = listOf(request.scrambles[attempt - 1]),
                        attempt = attempt,
                        totalAttempt = request.scrambles.size // useful for fmc
                    )
                } ?: request
            }.map { it.copy(roundStartTime = activity.getLocalStartTime(timeZone)) }

            return mappedRequests.takeIf { it.isNotEmpty() } ?: error("An activity of the schedule did not match an event.")
        }

        fun compareLettersCharToNumber(letters: String, number: Int): Boolean {
            val sum = letters.reversed().withIndex().sumBy { (i, c) ->
                (c - 'A' + 1) * (26f.pow(i).toInt())
            }

            return sum == number
        }

        // Currently, we mark not cubing related activities as other-lunch or other-speech, for example.
        // If we ever accept any other such ignorable key, it should be added here.
        private val WCIF_IGNORABLE_KEYS = listOf("other")
    }
}
