package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.webscrambles.plugins.EventPlugins

@Serializable
data class PersonalBest(val eventId: String, val best: @Serializable(with = AttemptResult.Companion::class) AttemptResult, val type: @Serializable(with = ResultType.Companion::class) ResultType, val worldRanking: Int, val continentalRanking: Int, val nationalRanking: Int) {
    val eventPlugin: EventPlugins?
        get() = EventPlugins.WCA_EVENTS[eventId]
}
