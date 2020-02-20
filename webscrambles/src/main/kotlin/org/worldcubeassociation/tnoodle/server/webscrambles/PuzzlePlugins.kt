package org.worldcubeassociation.tnoodle.server.webscrambles

import org.worldcubeassociation.tnoodle.scrambles.PuzzleRegistry

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
    val scramblerWithoutCache get() = registry.scrambler

    val cacheSize get() = SCRAMBLE_CACHERS[this.key]?.available

    fun warmUpCache(cacheSize: Int = CACHE_SIZE) {
        SCRAMBLE_CACHERS.getOrPut(this.key) { CoroutineScrambleCacher(this.registry.scrambler, cacheSize) }
    }

    fun generateEfficientScrambles(num: Int, action: (String) -> Unit = {}): List<String> {
        return List(num) {
            yieldScramble().also(action)
        }
    }

    private fun yieldScramble() = SCRAMBLE_CACHERS[this.key]
        ?.takeIf { it.available > 0 }?.getScramble()
        ?: this.scrambler.generateScramble()

    companion object {
        const val CACHE_SIZE = 30

        private val SCRAMBLE_CACHERS = mutableMapOf<String, CoroutineScrambleCacher>()

        val WCA_PUZZLES = values().associateBy { it.key }.toSortedMap()
    }
}
