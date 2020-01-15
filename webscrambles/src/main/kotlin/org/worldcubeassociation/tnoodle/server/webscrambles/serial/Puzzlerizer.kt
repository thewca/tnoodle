package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import kotlinx.serialization.*
import kotlinx.serialization.internal.StringDescriptor
import net.gnehzr.tnoodle.scrambles.Puzzle
import org.worldcubeassociation.tnoodle.server.webscrambles.PuzzlePlugins

@Serializer(forClass = Puzzle::class)
object Puzzlerizer : KSerializer<Puzzle> {
    override val descriptor: SerialDescriptor = StringDescriptor.withName("Puzzle")

    override fun deserialize(decoder: Decoder): Puzzle {
        val scramblerName = decoder.decodeString()
        val scramblers = PuzzlePlugins.PUZZLES

        val loadedScrambler by scramblers[scramblerName]
            ?: error("$scramblerName not found in: ${scramblers.keys}")

        return loadedScrambler
    }

    override fun serialize(encoder: Encoder, obj: Puzzle) {
        encoder.encodeString(obj.shortName)
    }
}
