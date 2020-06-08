package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.ExtensionProvider
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.provider.IndexingIdProvider

@Serializable
data class ScrambleSet(override val id: Int, val scrambles: List<@Serializable(with = Scramble.Companion::class) Scramble>, val extraScrambles: List<@Serializable(with = Scramble.Companion::class) Scramble>, override val extensions: List<Extension> = emptyList(), val hasGroupID: Boolean = true
) : ExtensionProvider(), IndexingIdProvider {
    val allScrambles: List<Scramble>
        get() = scrambles + extraScrambles

    companion object {
        fun empty(id: Int = 42) = ScrambleSet(id, emptyList(), emptyList(), emptyList())
    }
}
