package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import kotlinx.serialization.*
import kotlinx.serialization.internal.StringDescriptor
import org.worldcubeassociation.tnoodle.scrambles.Puzzle
import org.worldcubeassociation.tnoodle.server.webscrambles.PuzzlePlugins

@Serializer(forClass = Puzzle::class)
object Puzzlerizer : KSerializer<Puzzle> {
    override val descriptor: SerialDescriptor
        get() = StringDescriptor.withName("Puzzle")

    override fun deserialize(decoder: Decoder): Puzzle {
        val scramblers = PuzzlePlugins.WCA_PUZZLES
        val deserialized = decoder.decodeString()

        return scramblers[deserialized]?.value
            ?: error("$deserialized not found in: ${scramblers.keys}")
    }

    override fun serialize(encoder: Encoder, obj: Puzzle) {
        encoder.encodeString(obj.shortName)
    }
}
