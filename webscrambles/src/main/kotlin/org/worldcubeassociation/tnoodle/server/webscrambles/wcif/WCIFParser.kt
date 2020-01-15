package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import com.google.gson.JsonArray
import com.google.gson.JsonParser
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

object WCIFParser {
    fun parse(schedule: String): WCIF {
        val parsedSchedule = JsonParser.parseString(schedule)?.asJsonObject

        val rawVenues = parsedSchedule?.getAsJsonArray("venues") ?: JsonArray()

        val venues = rawVenues.map { it.asJsonObject }.map { jsonVenue ->
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

        val numberOfDays = parsedSchedule?.get("numberOfDays")?.asInt ?: 0

        val modelSchedule = Schedule(numberOfDays, venues)
        return WCIF(modelSchedule)
    }

    val WCIF_DATE_FORMAT = DateTimeFormatter.ISO_OFFSET_DATE_TIME

    fun String.parseWCIFDateWithTimezone(timeZone: ZoneId) = ZonedDateTime.parse(this, WCIF_DATE_FORMAT)
        .withZoneSameInstant(timeZone)

    fun ZonedDateTime.atLocalStartOfDay() = toLocalDate().atStartOfDay(zone).toLocalDate()
}
