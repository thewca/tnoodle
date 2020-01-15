package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Room
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.SafeNamed
import java.time.ZoneId

data class Venue(val name: String, val rooms: List<Room>, val timezone: String) : SafeNamed(name) {
    val hasMultipleRooms: Boolean
        get() = rooms.size > 1

    val dateTimeZone: ZoneId
        get() = ZoneId.of(timezone)
}
