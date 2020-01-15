package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import com.google.gson.JsonArray
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Activity
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Room
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Venue
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

import kotlin.math.pow

class WCIFHelper(schedule: String) {
    val schedule: JsonObject?

    val venues: List<Venue>
    val numberOfDays: Int

    init {
        val parsedSchedule = JsonParser.parseString(schedule)?.asJsonObject

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
        this.schedule = parsedSchedule
    }

    val earliestActivity: Activity
        get() = activitiesWithLocalStartTimes
            .minBy { it.value }
            ?.key
            ?: error("I could not find the earliest activity")

    val activitiesWithLocalStartTimes = venues
        .associateWith { it.rooms }
        .mapValues { it.value.flatMap(Room::activities) }
        // turn Map<Venue, List<Activity>> into Map<Activity, Venue>
        .flatMap { (v, act) ->
            act.map { it to v.dateTimeZone }
        }.toMap()
        // convert timezone to local start date of respective activity
        .mapValues { it.key.getLocalStartTime(it.value) }

    val hasMultipleDays: Boolean get() = numberOfDays > 1
    val hasMultipleVenues: Boolean get() = venues.size > 1

    companion object {
        val WCIF_DATE_FORMAT = DateTimeFormatter.ISO_OFFSET_DATE_TIME

        fun List<ScrambleRequest>.filterForActivity(activity: Activity): List<ScrambleRequest> {
            val activitySplit = activity.activityCode.split("-")
            val event = activitySplit[0]

            if (WCIF_IGNORABLE_KEYS.contains(event)) {
                return emptyList()
            }

            // This part assumes every round, group and attempt is labeled with an integer from competitionJson
            val round = activitySplit.findPrefixedGroup("r")?.toInt() ?: 0
            val group = activitySplit.findPrefixedGroup("g")?.toInt() ?: 0
            val attempt = activitySplit.findPrefixedGroup("a")?.toInt() ?: 0

            // First, we add all requests whose events equals what we need
            val matchingRequests = filter { it.event == event }
                // Then, we start removing, depending on the defined details.
                .filter { round <= 0 || it.round == round }
                .filter { group <= 0 || it.group.orEmpty().matchesNumericalIndex(group) }

            val mappedRequests = matchingRequests.map { request ->
                request.takeUnless { attempt > 0 }
                    ?: request.copyForAttempt(attempt)
            }

            return mappedRequests.takeIf { it.isNotEmpty() }
                ?: error("An activity of the schedule did not match an event.")
        }

        fun List<String>.findPrefixedGroup(prefix: String) =
            find { it.startsWith(prefix) }?.substring(prefix.length)

        fun ScrambleRequest.copyForAttempt(targetAttempt: Int) =
            copy(
                scrambles = listOf(scrambles[targetAttempt - 1]),
                attempt = targetAttempt,
                totalAttempt = scrambles.size // useful for FMC
            )

        fun String.parseWCIFDateWithTimezone(timeZone: ZoneId) = ZonedDateTime.parse(this, WCIF_DATE_FORMAT)
            .withZoneSameInstant(timeZone)

        fun ZonedDateTime.atLocalStartOfDay() = toLocalDate().atStartOfDay(zone).toLocalDate()

        fun String.matchesNumericalIndex(number: Int): Boolean {
            val sum = reversed().withIndex().sumBy { (i, c) ->
                (c - 'A' + 1) * (26f.pow(i).toInt())
            }

            return sum == number
        }

        // Currently, we mark not cubing related activities as other-lunch or other-speech, for example.
        // If we ever accept any other such ignorable key, it should be added here.
        private val WCIF_IGNORABLE_KEYS = listOf("other")
    }
}
