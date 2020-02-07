package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import kotlinx.serialization.*
import kotlinx.serialization.internal.StringDescriptor
import net.gnehzr.tnoodle.scrambles.Puzzle
import org.worldcubeassociation.tnoodle.server.webscrambles.PuzzlePlugins

@Serializer(forClass = Puzzle::class)
object Puzzlerizer : SingletonStringEncoder<Puzzle>("Puzzle") {
    override fun encodeInstance(instance: Puzzle) = instance.shortName

    override fun makeInstance(deserialized: String): Puzzle {
        val scramblers = PuzzlePlugins.PUZZLES

        return scramblers[deserialized]?.value
            ?: error("$deserialized not found in: ${scramblers.keys}")
    }
}
