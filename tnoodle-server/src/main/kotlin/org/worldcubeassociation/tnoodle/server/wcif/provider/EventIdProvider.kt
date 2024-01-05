package org.worldcubeassociation.tnoodle.server.wcif.provider

import org.worldcubeassociation.tnoodle.server.model.EventData

interface EventIdProvider {
    val eventId: String

    val eventModel: EventData?
        get() = EventData.WCA_EVENTS[eventId]
}
