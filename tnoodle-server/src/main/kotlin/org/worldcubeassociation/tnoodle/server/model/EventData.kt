package org.worldcubeassociation.tnoodle.server.model

enum class EventData(val key: String, val description: String, val scrambler: PuzzleData, val legalFormats: Set<FormatData>) {
    THREE(PuzzleData.THREE, FormatData.BIG_AVERAGE_FORMATS),
    TWO(PuzzleData.TWO, FormatData.BIG_AVERAGE_FORMATS),
    FOUR(PuzzleData.FOUR, FormatData.BIG_AVERAGE_FORMATS),
    FIVE(PuzzleData.FIVE, FormatData.BIG_AVERAGE_FORMATS),
    SIX(PuzzleData.SIX, FormatData.SMALL_AVERAGE_FORMATS),
    SEVEN(PuzzleData.SEVEN, FormatData.SMALL_AVERAGE_FORMATS),
    THREE_BLD("333bf", "3x3x3 Blindfolded", PuzzleData.THREE_BLD, FormatData.BLD_SPECIAL_FORMATS),
    THREE_FM(PuzzleData.THREE_FMC, FormatData.SMALL_AVERAGE_FORMATS),
    THREE_OH("333oh", "3x3x3 One-Handed", PuzzleData.THREE, FormatData.BIG_AVERAGE_FORMATS),
    CLOCK(PuzzleData.CLOCK, FormatData.BIG_AVERAGE_FORMATS),
    MEGA(PuzzleData.MEGA, FormatData.BIG_AVERAGE_FORMATS),
    PYRA(PuzzleData.PYRA, FormatData.BIG_AVERAGE_FORMATS),
    SKEWB(PuzzleData.SKEWB, FormatData.BIG_AVERAGE_FORMATS),
    SQ1(PuzzleData.SQ1, FormatData.BIG_AVERAGE_FORMATS),
    FOUR_BLD("444bf", "4x4x4 Blindfolded", PuzzleData.FOUR_BLD, FormatData.BLD_SPECIAL_FORMATS),
    FIVE_BLD("555bf", "5x5x5 Blindfolded", PuzzleData.FIVE_BLD, FormatData.BLD_SPECIAL_FORMATS),
    THREE_MULTI_BLD("333mbf", "3x3x3 Multiple Blindfolded", PuzzleData.THREE_BLD, FormatData.BLD_SPECIAL_FORMATS);

    constructor(scrambler: PuzzleData, legalFormats: Set<FormatData>) : this(scrambler.key, scrambler.description, scrambler, legalFormats)

    companion object {
        val WCA_EVENTS = values().associateBy { it.key }.toSortedMap()

        val ONE_HOUR_EVENTS = setOf(THREE_FM, THREE_MULTI_BLD)
        val ATTEMPT_BASED_EVENTS = setOf(THREE_FM, THREE_MULTI_BLD)
    }
}
