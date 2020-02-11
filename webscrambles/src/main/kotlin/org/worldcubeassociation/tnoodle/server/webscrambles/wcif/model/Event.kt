package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.scrambles.Puzzle
import org.worldcubeassociation.tnoodle.server.webscrambles.PuzzlePlugins

@Serializable
data class Event(val id: String, val rounds: List<Round>) {
    companion object {
        val EVENT_SCRAMBLER_MAPPING = mapOf(
            "333bf" to "333ni",
            "333oh" to "333",
            "444bf" to "444ni",
            "555bf" to "555ni",
            "333mbf" to "333ni"
        )

        val EVENT_NAMES = mapOf(
            "333bf" to "3x3x3 Blindfolded",
            "333oh" to "3x3x3 One-Handed",
            "444bf" to "4x4x4 Blindfolded",
            "555bf" to "5x5x5 Blindfolded",
            "333mbf" to "3x3x3 Multiple Blindfolded"
        )

        fun loadScrambler(eventId: String): Puzzle? {
            val puzzleId = EVENT_SCRAMBLER_MAPPING[eventId] ?: eventId
            val supplier = PuzzlePlugins.PUZZLES[puzzleId]

            return supplier?.value
        }

        fun getEventName(eventId: String) =
            EVENT_NAMES[eventId] ?: PuzzlePlugins.getScramblerLongName(eventId)
    }
}
