package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import com.google.gson.JsonArray
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

object WCIFParser {
    fun parseComplete(wcif: String): WCIF {
        val parsedObject = JsonParser.parseString(wcif)?.asJsonObject

        val schedule = parsedObject?.getAsJsonObject("schedule")
        val events = parsedObject?.getAsJsonArray("events")

        return parse(schedule, events)
    }

    fun parsePartial(schedule: String): WCIF {
        val parsedSchedule = JsonParser.parseString(schedule)?.asJsonObject

        return parse(parsedSchedule)
    }

    fun parse(scheduleRaw: JsonObject?, eventsRaw: JsonArray? = null): WCIF {
        val rawVenues = scheduleRaw?.getAsJsonArray("venues") ?: JsonArray()

        val venues = rawVenues.map { it.asJsonObject }.map { jsonVenue ->
            val rawRooms = jsonVenue.getAsJsonArray("rooms") ?: JsonArray()

            val rooms = rawRooms.map { it.asJsonObject }.map { jsonRoom ->
                val rawActivities = jsonRoom.asJsonObject.getAsJsonArray("activities") ?: JsonArray()

                val activities = rawActivities.map { it.asJsonObject }
                    .map { jsonActivity -> parseActivity(jsonActivity) }

                Room(jsonRoom.get("name").asString, activities)
            }

            Venue(jsonVenue.get("name").asString, rooms, jsonVenue.get("timezone").asString)
        }

        val numberOfDays = scheduleRaw?.get("numberOfDays")?.asInt ?: 0
        val modelSchedule = Schedule(numberOfDays, venues)

        val rawEvents = eventsRaw ?: JsonArray()

        val events = rawEvents.map { it.asJsonObject }.map { jsonEvent ->
            val rawRounds = jsonEvent.getAsJsonArray("rounds") ?: JsonArray()

            val rounds = rawRounds.map { it.asJsonObject }.map { jsonRound ->
                Round(jsonRound.get("id").asString, jsonRound.get("format").asString, jsonRound.get("scrambleSetCount").asInt)
            }

            Event(jsonEvent.get("id").asString, rounds)
        }

        return WCIF(events, modelSchedule)
    }

    private fun parseActivity(rawActivity: JsonObject): Activity {
        val children = rawActivity.get("childActivities").asJsonArray
            .map { it.asJsonObject }
            .map { parseActivity(it) }

        return Activity(
            rawActivity.get("activityCode").asString,
            rawActivity.get("startTime").asString,
            children
        )
    }

    val WCIF_DATE_FORMAT = DateTimeFormatter.ISO_OFFSET_DATE_TIME

    fun String.parseWCIFDateWithTimezone(timeZone: ZoneId) = ZonedDateTime.parse(this, WCIF_DATE_FORMAT)
        .withZoneSameInstant(timeZone)

    fun ZonedDateTime.atLocalStartOfDay() = toLocalDate().atStartOfDay(zone).toLocalDate()
}
