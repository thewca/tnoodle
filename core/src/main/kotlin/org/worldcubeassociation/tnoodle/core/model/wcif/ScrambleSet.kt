package org.worldcubeassociation.tnoodle.core.model.wcif

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.core.model.wcif.extension.ExtensionProvider
import org.worldcubeassociation.tnoodle.core.model.wcif.provider.IndexingIdProvider

@Serializable
data class ScrambleSet(
    override val id: Int,
    val scrambles: List<@Serializable(with = Scramble.Companion::class) Scramble>,
    val extraScrambles: List<@Serializable(with = Scramble.Companion::class) Scramble>,
    override val extensions: List<Extension> = emptyList()
) : ExtensionProvider(), IndexingIdProvider {
    val allScrambles: List<Scramble>
        get() = scrambles + extraScrambles

    companion object {
        fun empty(id: Int = 42) = ScrambleSet(id, emptyList(), emptyList(), emptyList())
    }
}
