package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.provider.SafeNameProvider
import java.time.ZoneId

@Serializable
data class Venue(val id: Int, override val name: String, val rooms: List<Room>, val timezone: String) : SafeNameProvider {
    val hasMultipleRooms: Boolean
        get() = rooms.size > 1

    val dateTimeZone: ZoneId
        get() = ZoneId.of(timezone)
}
