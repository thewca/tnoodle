package org.worldcubeassociation.tnoodle.core.model.wcif

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.core.model.wcif.provider.EventIdProvider

@Serializable
data class Event(val id: String, val rounds: List<Round>) : EventIdProvider {
    override val eventId: String
        get() = id
}
