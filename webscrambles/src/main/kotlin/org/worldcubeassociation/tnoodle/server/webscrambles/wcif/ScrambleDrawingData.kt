package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import org.worldcubeassociation.tnoodle.server.webscrambles.PuzzlePlugins
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.ActivityCode
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.FmcExtension
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.ScrambleSet
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.findExtension

data class ScrambleDrawingData(val scrambleSet: ScrambleSet, val activityCode: ActivityCode) {
    val scramblingPuzzle = PuzzlePlugins.PUZZLES[activityCode.eventId]?.value // FIXME WCIF bf --> ni
        ?: error("Cannot draw PDF: Scrambler for $activityCode not found in plugins")

    val isFmc: Boolean
        get() = scrambleSet.extensions
            .findExtension<FmcExtension>()
            ?.data ?: false
}
