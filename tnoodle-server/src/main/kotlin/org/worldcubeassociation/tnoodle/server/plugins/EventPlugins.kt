package org.worldcubeassociation.tnoodle.server.plugins

enum class EventPlugins(val key: String, val description: String, val scrambler: PuzzlePlugins, val legalFormats: Set<FormatPlugins>) {
    THREE(PuzzlePlugins.THREE, FormatPlugins.BIG_AVERAGE_FORMATS),
    TWO(PuzzlePlugins.TWO, FormatPlugins.BIG_AVERAGE_FORMATS),
    FOUR(PuzzlePlugins.FOUR, FormatPlugins.BIG_AVERAGE_FORMATS),
    FIVE(PuzzlePlugins.FIVE, FormatPlugins.BIG_AVERAGE_FORMATS),
    SIX(PuzzlePlugins.SIX, FormatPlugins.SMALL_AVERAGE_FORMATS),
    SEVEN(PuzzlePlugins.SEVEN, FormatPlugins.SMALL_AVERAGE_FORMATS),
    THREE_BLD("333bf", "3x3x3 Blindfolded", PuzzlePlugins.THREE_BLD, FormatPlugins.BLD_SPECIAL_FORMATS),
    THREE_FM(PuzzlePlugins.THREE_FMC, FormatPlugins.SMALL_AVERAGE_FORMATS),
    THREE_OH("333oh", "3x3x3 One-Handed", PuzzlePlugins.THREE, FormatPlugins.BIG_AVERAGE_FORMATS),
    CLOCK(PuzzlePlugins.CLOCK, FormatPlugins.BIG_AVERAGE_FORMATS),
    MEGA(PuzzlePlugins.MEGA, FormatPlugins.BIG_AVERAGE_FORMATS),
    PYRA(PuzzlePlugins.PYRA, FormatPlugins.BIG_AVERAGE_FORMATS),
    SKEWB(PuzzlePlugins.SKEWB, FormatPlugins.BIG_AVERAGE_FORMATS),
    SQ1(PuzzlePlugins.SQ1, FormatPlugins.BIG_AVERAGE_FORMATS),
    FOUR_BLD("444bf", "4x4x4 Blindfolded", PuzzlePlugins.FOUR_BLD, FormatPlugins.BLD_SPECIAL_FORMATS),
    FIVE_BLD("555bf", "5x5x5 Blindfolded", PuzzlePlugins.FIVE_BLD, FormatPlugins.BLD_SPECIAL_FORMATS),
    THREE_MULTI_BLD("333mbf", "3x3x3 Multiple Blindfolded", PuzzlePlugins.THREE_BLD, FormatPlugins.BLD_SPECIAL_FORMATS);

    constructor(scrambler: PuzzlePlugins, legalFormats: Set<FormatPlugins>) : this(scrambler.key, scrambler.description, scrambler, legalFormats)

    companion object {
        val WCA_EVENTS = values().associateBy { it.key }.toSortedMap()

        val ONE_HOUR_EVENTS = setOf(THREE_FM, THREE_MULTI_BLD)
    }
}
