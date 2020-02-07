package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

object WCIFParser {
    fun parseComplete(wcif: String): Competition {
        return JsonConfig.SERIALIZER.parse(Competition.serializer(), wcif)
    }

    fun parsePartial(schedule: String): Competition {
        return Competition(emptyList(), JsonConfig.SERIALIZER.parse(Schedule.serializer(), schedule))
    }

    val WCIF_DATE_FORMAT = DateTimeFormatter.ISO_OFFSET_DATE_TIME

    fun String.parseWCIFDateWithTimezone(timeZone: ZoneId) = ZonedDateTime.parse(this, WCIF_DATE_FORMAT)
        .withZoneSameInstant(timeZone)

    fun ZonedDateTime.atLocalStartOfDay() = toLocalDate().atStartOfDay(zone).toLocalDate()
}
