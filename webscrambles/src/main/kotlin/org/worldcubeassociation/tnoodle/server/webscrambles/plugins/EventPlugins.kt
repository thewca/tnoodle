package org.worldcubeassociation.tnoodle.server.webscrambles.plugins

enum class EventPlugins(val key: String, val description: String, val scrambler: PuzzlePlugins) {
    TWO(PuzzlePlugins.TWO),
    THREE(PuzzlePlugins.THREE),
    THREE_BLD("333bf", "3x3x3 Blindfolded", PuzzlePlugins.THREE_BLD),
    THREE_OH("333oh", "3x3x3 One-Handed", PuzzlePlugins.THREE),
    THREE_FM(PuzzlePlugins.THREE_FMC),
    THREE_MULTI_BLD("333mbf", "3x3x3 Multiple Blindfolded", PuzzlePlugins.THREE_BLD),
    FOUR(PuzzlePlugins.FOUR),
    FOUR_BLD("444bf", "4x4x4 Blindfolded", PuzzlePlugins.FOUR_BLD),
    FIVE(PuzzlePlugins.FIVE),
    FIVE_BLD("555bf", "5x5x5 Blindfolded", PuzzlePlugins.FIVE_BLD),
    SIX(PuzzlePlugins.SIX),
    SEVEN(PuzzlePlugins.SEVEN),
    PYRA(PuzzlePlugins.PYRA),
    SQ1(PuzzlePlugins.SQ1),
    MEGA(PuzzlePlugins.MEGA),
    CLOCK(PuzzlePlugins.CLOCK),
    SKEWB(PuzzlePlugins.SKEWB);

    constructor(scrambler: PuzzlePlugins) : this(scrambler.key, scrambler.description, scrambler)

    companion object {
        val WCA_EVENTS = values().associateBy { it.key }.toSortedMap()
    }
}
