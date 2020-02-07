package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable

@Serializable
data class ScrambleSet(val id: Int, val scrambles: List<Scramble>, val extraScrambles: List<Scramble>, val extensions: List<Extension>) {
    val allScrambles: List<Scramble>
        get() = scrambles + extraScrambles
}
