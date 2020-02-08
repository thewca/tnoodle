package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.Extension
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.ExtensionProvider

@Serializable
data class ScrambleSet(val id: Int, val scrambles: List<@Serializable(with = Scramble.Companion::class) Scramble>, val extraScrambles: List<@Serializable(with = Scramble.Companion::class) Scramble>, override val extensions: List<Extension> = emptyList()) : ExtensionProvider() {
    val allScrambles: List<Scramble>
        get() = scrambles + extraScrambles

    companion object {
        fun empty(id: Int = 42) = ScrambleSet(id, emptyList(), emptyList(), emptyList())
    }
}
