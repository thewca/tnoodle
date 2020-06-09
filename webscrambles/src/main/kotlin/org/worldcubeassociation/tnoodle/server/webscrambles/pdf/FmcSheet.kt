package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.FmcAttemptCountExtension
import java.util.Locale

abstract class FmcSheet(scrambleSet: ScrambleSet, activityCode: ActivityCode, val competitionTitle: String, val locale: Locale, val hasGroupID: Boolean) : BaseScrambleSheet(scrambleSet, activityCode) {
    val expectedAttemptNum: Int
        get() = scrambleSet.findExtension<FmcAttemptCountExtension>()
            ?.totalAttempts ?: 1

    companion object {
        const val WCA_MAX_MOVES_FMC = 80
    }
}
