package org.worldcubeassociation.tnoodle.server.serial

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.model.EventData

@Serializable
data class EventFrontendData(
    val id: String,
    val name: String,
    @SerialName("puzzle_id") val puzzleId: String,
    @SerialName("puzzle_group_id") val puzzleGroupId: String?,
    @SerialName("format_ids") val formatIds: List<String>,
    @SerialName("can_change_time_limit") val canChangeTimeLimit: Boolean,
    @SerialName("is_timed_event") val isTimedEvent: Boolean,
    @SerialName("is_fewest_moves") val isFewestMoves: Boolean,
    @SerialName("is_multiple_blindfolded") val isMultipleBlindfolded: Boolean
) {
    companion object {
        fun fromDataModel(event: EventData): EventFrontendData {
            val rootScrambler = event.scrambler.rootScrambler

            return EventFrontendData(
                event.id,
                event.description,
                rootScrambler.id,
                rootScrambler.groupId,
                event.legalFormats.map { it.key },
                event !in EventData.ONE_HOUR_EVENTS,
                event !in EventData.ONE_HOUR_EVENTS,
                event == EventData.THREE_FM,
                event == EventData.THREE_MULTI_BLD
            )
        }
    }
}
