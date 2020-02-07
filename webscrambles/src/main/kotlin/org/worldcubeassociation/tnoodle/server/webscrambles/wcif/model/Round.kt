package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable

@Serializable
data class Round(val id: String, val format: String, val scrambleSetCount: Int, val scrambleSets: List<ScrambleSet>) {
    val idCode: ActivityCode
        get() = ActivityCode(id)

    val expectedAttemptNum: Int
        get() = format.toIntOrNull() ?: FORMAT_SCRAMBLE_COUNTS[format] ?: 0 // FIXME WCIF better default?

    companion object {
        private val FORMAT_SCRAMBLE_COUNTS = mapOf(
            "a" to 5,
            "m" to 3
        )
    }
}
