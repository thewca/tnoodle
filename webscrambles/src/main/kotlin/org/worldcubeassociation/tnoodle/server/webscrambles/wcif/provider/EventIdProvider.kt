package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.provider

import org.worldcubeassociation.tnoodle.server.plugins.EventPlugins

interface EventIdProvider {
    val eventId: String

    val eventPlugin: EventPlugins?
        get() = EventPlugins.WCA_EVENTS[eventId]
}
