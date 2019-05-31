package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import org.joda.time.DateTime
import org.joda.time.DateTimeZone

data class Activity(val activityCode: String, val startTime: String) {
    fun getLocalStartTime(timeZone: DateTimeZone) = DateTime(startTime, timeZone)
}
