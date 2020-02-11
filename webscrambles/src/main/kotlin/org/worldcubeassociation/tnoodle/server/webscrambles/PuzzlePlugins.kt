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
    val scrambler get() = registry.also { warmUpCache() }.scrambler

    val cacheSize get() = SCRAMBLE_CACHERS[this.key]?.availableCount

    fun warmUpCache(cacheSize: Int = CACHE_SIZE) {
        SCRAMBLE_CACHERS.getOrPut(this.key) { ScrambleCacher(this.registry.scrambler, cacheSize, false) }
    }

    fun generateEfficientScrambles(num: Int): Array<String> {
        return SCRAMBLE_CACHERS[this.key]?.newScrambles(num)
            ?: this.scrambler.generateScrambles(num)
    }

    companion object {
        const val CACHE_SIZE = 30

        private val SCRAMBLE_CACHERS = mutableMapOf<String, ScrambleCacher>()

        val WCA_PUZZLES = values().associateBy { it.key }.toSortedMap()
    }
}
