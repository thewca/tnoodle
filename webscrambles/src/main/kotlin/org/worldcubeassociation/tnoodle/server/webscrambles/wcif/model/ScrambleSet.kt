package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable

@Serializable
data class ScrambleSet(val id: Int, val scrambles: List<Scramble>, val extraScrambles: List<Scramble>, val extensions: List<Extension> = emptyList()) {
    val allScrambles: List<Scramble>
        get() = scrambles + extraScrambles

    companion object {
        fun empty(id: Int = 42) = ScrambleSet(id, emptyList(), emptyList(), emptyList())
    }
}
