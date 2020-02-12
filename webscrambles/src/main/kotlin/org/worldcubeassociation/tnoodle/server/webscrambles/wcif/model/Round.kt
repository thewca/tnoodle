package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.ExtensionProvider

@Serializable
data class Round(val id: String, val format: String, val scrambleSetCount: Int, val scrambleSets: List<ScrambleSet> = emptyList(), override val extensions: List<Extension> = emptyList()): ExtensionProvider() {
    val idCode: ActivityCode
        get() = ActivityCode(id)

    val expectedAttemptNum: Int
        get() = format.toIntOrNull() ?: FORMAT_SCRAMBLE_COUNTS[format] ?: 5 // FIXME better default?

    companion object {
        private val FORMAT_SCRAMBLE_COUNTS = mapOf(
            "a" to 5,
            "m" to 3
        )
    }
}
