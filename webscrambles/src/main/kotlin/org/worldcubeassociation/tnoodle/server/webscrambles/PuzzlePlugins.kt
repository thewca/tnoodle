package org.worldcubeassociation.tnoodle.server.webscrambles

import org.worldcubeassociation.tnoodle.scrambles.Puzzle
import org.worldcubeassociation.tnoodle.scrambles.PuzzleRegistry
import org.worldcubeassociation.tnoodle.scrambles.ScrambleCacher
import org.worldcubeassociation.tnoodle.server.webscrambles.server.Plugins
import java.util.*

object PuzzlePlugins {
    private val plugins = Plugins()

    val PUZZLES: SortedMap<String, Lazy<Puzzle>> by lazy { getScramblers() }
    val SCRAMBLE_CACHERS: Map<String, ScrambleCacher> get() = plugins.cachers

    private fun getScramblers(): SortedMap<String, Lazy<Puzzle>> {
        plugins.register(PuzzleRegistry.TWO)
        plugins.register(PuzzleRegistry.THREE)
        plugins.register(PuzzleRegistry.FOUR)
        plugins.register(PuzzleRegistry.FIVE)
        plugins.register(PuzzleRegistry.SIX)
        plugins.register(PuzzleRegistry.SEVEN)
        plugins.register(PuzzleRegistry.THREE_NI)
        plugins.register(PuzzleRegistry.FOUR_NI)
        plugins.register(PuzzleRegistry.FIVE_NI)
        plugins.register(PuzzleRegistry.THREE_FM)
        plugins.register(PuzzleRegistry.PYRA)
        plugins.register(PuzzleRegistry.SQ1)
        plugins.register(PuzzleRegistry.MEGA)
        plugins.register(PuzzleRegistry.CLOCK)
        plugins.register(PuzzleRegistry.SKEWB)

        return plugins.plugins.toSortedMap(naturalOrder())
    }
}
