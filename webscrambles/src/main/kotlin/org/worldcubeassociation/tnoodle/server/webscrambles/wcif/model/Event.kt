package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.webscrambles.EventPlugins

@Serializable
data class Event(val id: String, val rounds: List<Round>) {
    val plugin get() = EventPlugins.WCA_EVENTS[id]

    companion object {
        fun findPuzzlePlugin(eventId: String) = EventPlugins.WCA_EVENTS[eventId]?.scrambler

        fun getEventName(eventId: String) = EventPlugins.WCA_EVENTS[eventId]?.description
    }
}
