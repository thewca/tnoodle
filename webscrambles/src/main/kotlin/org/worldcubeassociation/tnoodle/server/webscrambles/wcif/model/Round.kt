package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable
import net.gnehzr.tnoodle.scrambles.Puzzle
import org.worldcubeassociation.tnoodle.server.webscrambles.PuzzlePlugins

@Serializable
data class Round(val id: String, val format: String, val scrambleSetCount: Int, val scrambleSets: List<ScrambleSet> = emptyList(), val extensions: List<Extension> = emptyList()) {
    val idCode: ActivityCode
        get() = ActivityCode(id)

    val expectedAttemptNum: Int
        get() = format.toIntOrNull() ?: FORMAT_SCRAMBLE_COUNTS[format] ?: 0 // FIXME WCIF better default?

    fun loadScrambler(): Puzzle {
        val puzzleId = EVENT_MAPPING[idCode.eventId] ?: idCode.eventId
        val supplier = PuzzlePlugins.PUZZLES[puzzleId] ?: error("Unable to load puzzle $puzzleId")

        return supplier.value
    }

    companion object {
        private val FORMAT_SCRAMBLE_COUNTS = mapOf(
            "a" to 5,
            "m" to 3
        )

        private val EVENT_MAPPING = mapOf(
            "333bf" to "333ni",
            "333oh" to "333",
            "444bf" to "444ni",
            "555bf" to "555ni",
            "333mbf" to "333ni"
        )
    }
}
