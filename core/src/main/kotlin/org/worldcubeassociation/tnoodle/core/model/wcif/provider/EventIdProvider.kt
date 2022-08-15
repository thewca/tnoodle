package org.worldcubeassociation.tnoodle.core.model.wcif.provider

import org.worldcubeassociation.tnoodle.core.model.scramble.EventData

interface EventIdProvider {
    val eventId: String

    val eventModel: EventData?
        get() = EventData.WCA_EVENTS[eventId]
}
