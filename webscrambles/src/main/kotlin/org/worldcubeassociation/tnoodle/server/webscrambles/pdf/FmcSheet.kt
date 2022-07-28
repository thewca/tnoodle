package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.FmcAttemptCountExtension
import java.util.Locale
import kotlin.math.max

abstract class FmcSheet(
    scrambleSet: ScrambleSet,
    activityCode: ActivityCode,
    val competitionTitle: String,
    val locale: Locale,
    val hasGroupID: Boolean
) : BaseScrambleSheet(scrambleSet, activityCode) {
    val expectedAttemptNum: Int
        get() = scrambleSet.findExtension<FmcAttemptCountExtension>()
            ?.totalAttempts ?: 1

    val localEventTitle: String
        get() = Translate.translate("fmc.event", locale)

    val attemptDetails: String
        get() = activityCode.copyParts(attemptNumber = null) // FMC is split per attempt so we count scrambleXofY instead
            .compileTitleString(locale, includeEvent = false, includeGroupId = hasGroupID)

    val activityTitle: String
        get() = "$localEventTitle $attemptDetails".trim()

    fun computeLocalScrambleNumDescription(index: Int): String {
        val attemptIndex = activityCode.attemptNumber ?: index
        val orderedIndex = max(attemptIndex, index) + 1

        val substitutions = mapOf(
            "scrambleIndex" to orderedIndex.toString(),
            "scrambleCount" to expectedAttemptNum.toString()
        )

        return Translate.translate("fmc.scrambleXofY", locale, substitutions)
    }

    companion object {
        const val WCA_MAX_MOVES_FMC = 80
    }
}
