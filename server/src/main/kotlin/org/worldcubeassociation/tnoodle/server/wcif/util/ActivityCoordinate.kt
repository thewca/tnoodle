package org.worldcubeassociation.tnoodle.server.wcif.util

import org.worldcubeassociation.tnoodle.server.wcif.model.Venue
import org.worldcubeassociation.tnoodle.server.wcif.model.Room
import org.worldcubeassociation.tnoodle.server.wcif.model.Activity
import java.time.ZonedDateTime

data class ActivityCoordinate(
    val venue: Venue,
    val room: Room,
    val activity: Activity,
) {
    val localStartTime: ZonedDateTime
        get() = this.activity.getLocalStartTime(this.venue.dateTimeZone)
}
