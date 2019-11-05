package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import java.time.LocalDateTime
import java.time.ZoneId
import java.time.ZonedDateTime

data class Activity(val activityCode: String, val startTime: String) {
    fun getLocalStartTime(timeZone: ZoneId) = ZonedDateTime.of(LocalDateTime.parse(startTime), timeZone)
}
