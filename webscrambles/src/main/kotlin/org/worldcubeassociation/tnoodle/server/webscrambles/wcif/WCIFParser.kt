package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

object WCIFParser {
    private val SERIALIZER = JsonConfig[JsonConfig.SERIALIZER_WCIF]

    fun parseComplete(wcif: String): Competition {
        return SERIALIZER.parse(Competition.serializer(), wcif)
    }

    fun parsePartial(schedule: String): Competition {
        val parsedSchedule = SERIALIZER.parse(Schedule.serializer(), schedule)
        return Competition("1.0", "id", "name", "shortName", emptyList(), parsedSchedule)
    }

    val WCIF_DATE_FORMAT = DateTimeFormatter.ISO_OFFSET_DATE_TIME

    fun String.parseWCIFDateWithTimezone(timeZone: ZoneId) = ZonedDateTime.parse(this, WCIF_DATE_FORMAT)
        .withZoneSameInstant(timeZone)

    fun ZonedDateTime.atLocalStartOfDay() = toLocalDate().atStartOfDay(zone).toLocalDate()
}
