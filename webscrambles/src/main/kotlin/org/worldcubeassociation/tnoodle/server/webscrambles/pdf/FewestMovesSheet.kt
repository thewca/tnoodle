package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import java.util.Locale

abstract class FewestMovesSheet(
    val scramble: Scramble,
    val totalAttemptsNum: Int,
    override val scrambleSetId: Int,
    competitionTitle: String,
    activityCode: ActivityCode,
    hasGroupId: Boolean,
    locale: Locale,
    watermark: String?
) : ScrambleSheet(competitionTitle, activityCode, hasGroupId, locale, watermark) {
    override val scrambles: List<Scramble>
        get() = listOfNotNull(scramble)

    val currentAttemptNum: Int
        get() = activityCode.attemptNumber?.plus(1) ?: 1

    val localEventTitle: String
        get() = Translate("fmc.event", locale)

    val attemptDetails: String
        get() = activityCode.copyParts(attemptNumber = null) // FMC is split per attempt so we count scrambleXofY instead
            .compileTitleString(locale, includeEvent = false, includeGroupId = hasGroupId)

    val activityTitle: String
        get() = "$localEventTitle $attemptDetails".trim()

    val scrambleXOfY
        get(): String {
            val substitutions = mapOf(
                "scrambleIndex" to currentAttemptNum.toString(),
                "scrambleCount" to totalAttemptsNum.toString()
            )

            return Translate("fmc.scrambleXofY", locale, substitutions)
        }

    companion object {
        const val MOVE_BARS_PER_LINE = 10
        const val MOVE_BAR_LINES = 8

        const val WCA_MAX_MOVES_FMC = MOVE_BARS_PER_LINE * MOVE_BAR_LINES
    }
}
