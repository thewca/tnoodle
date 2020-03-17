package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.provider.EventIdProvider

@Serializable
data class Event(val id: String, val rounds: List<Round>) : EventIdProvider {
    override val eventId: String
        get() = id
}
