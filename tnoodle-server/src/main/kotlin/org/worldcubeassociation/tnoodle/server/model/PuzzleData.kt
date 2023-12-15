package org.worldcubeassociation.tnoodle.server.model

import org.worldcubeassociation.tnoodle.scrambles.PuzzleRegistry
import org.worldcubeassociation.tnoodle.server.model.cache.CoroutineScrambleCacher

enum class PuzzleData(
    private val registry: PuzzleRegistry,
    private val parentScrambler: PuzzleData? = null,
    val groupId: String? = null
) {
    // To all fellow programmers who wonder about effectively copying an interface:
    // 1-- Be able to intercept the `scrambler` reference (see getter below)
    // 2-- Be able to limit the selection of tnoodle-lib `Puzzle`s that are exposed.
    TWO(PuzzleRegistry.TWO, groupId = "nbyn"),
    THREE(PuzzleRegistry.THREE, groupId = "nbyn"),
    FOUR(PuzzleRegistry.FOUR, groupId = "nbyn"),
    FIVE(PuzzleRegistry.FIVE, groupId = "nbyn"),
    SIX(PuzzleRegistry.SIX, groupId = "nbyn"),
    SEVEN(PuzzleRegistry.SEVEN, groupId = "nbyn"),
    THREE_BLD(PuzzleRegistry.THREE_NI, THREE, groupId = "nbyn"),
    FOUR_BLD(PuzzleRegistry.FOUR_NI, FOUR, groupId = "nbyn"),
    FIVE_BLD(PuzzleRegistry.FIVE_NI, FIVE, groupId = "nbyn"),
    THREE_FMC(PuzzleRegistry.THREE_FM, THREE, groupId = "nbyn"),
    PYRA(PuzzleRegistry.PYRA),
    SQ1(PuzzleRegistry.SQ1),
    MEGA(PuzzleRegistry.MEGA),
    CLOCK(PuzzleRegistry.CLOCK),
    SKEWB(PuzzleRegistry.SKEWB);

    // TODO have tnoodle-lib provide an interface that this stuff can be delegated to
    val id get() = registry.key
    val description get() = registry.description
    val scrambler get() = registry.scrambler
    val scramblerWithCache get() = registry.also { warmUpCache() }.scrambler

    val cacheSize get() = SCRAMBLE_CACHERS[this.id]?.available

    val rootScrambler: PuzzleData get() = this.parentScrambler?.rootScrambler ?: this

    fun warmUpCache(cacheSize: Int = CACHE_SIZE) {
        SCRAMBLE_CACHERS.getOrPut(this.id) { CoroutineScrambleCacher(this.registry.scrambler, cacheSize) }
    }

    fun generateEfficientScrambles(num: Int, action: (String) -> Unit = {}): List<String> {
        return generateSequence { yieldScramble() }
            .distinct() // TODO ideally detect isomorphic states too, but most puzzles don't support rotations rn
            .onEach(action)
            .take(num)
            .toList()
    }

    fun generateScramble(action: (String) -> Unit = {}): String {
        return yieldScramble().also(action)
    }

    private fun yieldScramble() = SCRAMBLE_CACHERS[this.id]
        ?.takeIf { it.available > 0 }?.getScramble()
        ?: this.scramblerWithCache.generateScramble()

    companion object {
        const val CACHE_SIZE = 14

        private val SCRAMBLE_CACHERS = mutableMapOf<String, CoroutineScrambleCacher>()

        val WCA_PUZZLES = values().associateBy { it.id }.toSortedMap()
    }
}
