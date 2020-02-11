package org.worldcubeassociation.tnoodle.server.webscrambles

import org.worldcubeassociation.tnoodle.scrambles.PuzzleRegistry
import org.worldcubeassociation.tnoodle.scrambles.ScrambleCacher

enum class PuzzlePlugins(private val registry: PuzzleRegistry) {
    // To all fellow programmers who wonder about effectively copying an interface:
    // 1-- Be able to intercept the `scrambler` reference (see getter below)
    // 2-- Be able to limit the selection of tnoodle-lib `Puzzle`s that are exposed.
    TWO(PuzzleRegistry.TWO),
    THREE(PuzzleRegistry.THREE),
    FOUR(PuzzleRegistry.FOUR),
    FIVE(PuzzleRegistry.FIVE),
    SIX(PuzzleRegistry.SIX),
    SEVEN(PuzzleRegistry.SEVEN),
    THREE_BLD(PuzzleRegistry.THREE_NI),
    FOUR_BLD(PuzzleRegistry.FOUR_NI),
    FIVE_BLD(PuzzleRegistry.FIVE_NI),
    THREE_FMC(PuzzleRegistry.THREE_FM),
    PYRA(PuzzleRegistry.PYRA),
    SQ1(PuzzleRegistry.SQ1),
    MEGA(PuzzleRegistry.MEGA),
    CLOCK(PuzzleRegistry.CLOCK),
    SKEWB(PuzzleRegistry.SKEWB);

    // TODO have tnoodle-lib provide an interface that this stuff can be delegated to
    val key get() = registry.key
    val description get() = registry.description
    val scrambler get() = registry.also { warmUpCache(it) }.scrambler

    private fun warmUpCache(value: PuzzleRegistry, cacheSize: Int = CACHE_SIZE) {
        SCRAMBLE_CACHERS.computeIfAbsent(value.key) { ScrambleCacher(value.scrambler, cacheSize, false) }
    }

    companion object {
        const val CACHE_SIZE = 30

        val WCA_PUZZLES = values().associateBy { it.key }.toSortedMap()
        private val SCRAMBLE_CACHERS = mutableMapOf<String, ScrambleCacher>()
    }
}
