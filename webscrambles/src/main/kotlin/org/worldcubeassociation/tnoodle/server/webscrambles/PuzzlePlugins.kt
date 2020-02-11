package org.worldcubeassociation.tnoodle.server.webscrambles

import org.worldcubeassociation.tnoodle.scrambles.Puzzle
import org.worldcubeassociation.tnoodle.scrambles.PuzzleRegistry
import org.worldcubeassociation.tnoodle.scrambles.ScrambleCacher
import java.util.*

class PuzzlePlugins {
    private val plugins = mutableSetOf<PuzzleRegistry>()
    private val extraCachers = mutableMapOf<String, ScrambleCacher>()

    val lazyMapping: Map<PuzzleRegistry, Lazy<Puzzle>>
        get() = plugins.associateWith { makeLazy(it) }

    val loadedCachers: Map<String, ScrambleCacher>
        get() = extraCachers

    fun register(value: PuzzleRegistry) {
        plugins += value
    }

    private fun makeLazy(value: PuzzleRegistry): Lazy<Puzzle> {
        return lazy { value.also { warmUpCache(it) }.scrambler }
    }

    private fun warmUpCache(value: PuzzleRegistry, cacheSize: Int = CACHE_SIZE) {
        extraCachers.computeIfAbsent(value.key) { ScrambleCacher(value.scrambler, cacheSize, false) }
    }

    companion object {
        const val CACHE_SIZE = 30

        private val plugins = PuzzlePlugins()

        val PUZZLES: SortedMap<String, Lazy<Puzzle>> by lazy { loadScramblers() }
        val SCRAMBLE_CACHERS: Map<String, ScrambleCacher> get() = plugins.loadedCachers

        private fun loadScramblers(): SortedMap<String, Lazy<Puzzle>> {
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

            return plugins.lazyMapping
                .mapKeys { it.key.key }
                .toSortedMap(naturalOrder())
        }

        private fun findRegistryEntry(puzzleKey: String) =
            plugins.plugins.find { it.key == puzzleKey }

        fun initiateCaching(puzzleKey: String) =
            findRegistryEntry(puzzleKey)
                ?.let { plugins.warmUpCache(it) }
    }
}
