package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import kotlinx.serialization.*
import org.worldcubeassociation.tnoodle.scrambles.Puzzle
import org.worldcubeassociation.tnoodle.server.webscrambles.plugins.PuzzlePlugins

object Puzzlerizer : SingletonStringEncoder<Puzzle>("Puzzle") {
    override fun serialize(encoder: Encoder, obj: Puzzle) {
        encoder.encodeString(obj.shortName)
    }

    override fun encodeInstance(instance: Puzzle) = instance.shortName
    override fun makeInstance(deserialized: String): Puzzle {
        val scramblers = PuzzlePlugins.WCA_PUZZLES

        return scramblers[deserialized]?.scrambler
            ?: error("$deserialized not found in: ${scramblers.keys}")
    }
}
