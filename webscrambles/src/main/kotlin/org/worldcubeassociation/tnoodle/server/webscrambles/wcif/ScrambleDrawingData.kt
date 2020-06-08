package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.*
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.ActivityCode
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Scramble
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.FmcExtension
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.ScrambleSet
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.MultiScrambleCountExtension
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.SheetCopyCountExtension
import java.time.LocalDate
import java.util.*

data class CompetitionDrawingData(val competitionTitle: String, val scrambleSheets: List<ScrambleDrawingData>)

data class ScrambleDrawingData(val scrambleSet: ScrambleSet, val activityCode: ActivityCode, val watermark: String? = null) {
    val isFmc: Boolean
        get() = scrambleSet.findExtension<FmcExtension>()
            ?.isFmc ?: (activityCode.eventModel == EventData.THREE_FM)

    val hasGroupID: Boolean = scrambleSet.hasGroupID

    val numCopies: Int
        get() = scrambleSet.findExtension<SheetCopyCountExtension>()
            ?.numCopies ?: 1

    fun createPdf(creationDate: LocalDate, versionTag: String, sheetTitle: String, locale: Locale): PdfContent {
        // 333mbf is handled pretty specially: each "scramble" is actually a newline separated
        // list of 333ni scrambles.
        // If we detect that we're dealing with 333mbf, then we will generate 1 sheet per attempt,
        // rather than 1 sheet per round (as we do with every other event).

        // for ordered scrambles, we recreate scrambleRequest so it contains only 1 scramble
        // to fix this, we pass the attempt number
        if (activityCode.eventModel == EventData.THREE_MULTI_BLD && !scrambleSet.hasExtension<MultiScrambleCountExtension>()) {
            val singleSheets = scrambleSet.scrambles.mapIndexed { nthAttempt, scrambleStr ->
                val scrambles = scrambleStr.allScrambleStrings.map { Scramble(it) }

                // +1 for human readability so the first attempt (index 0) gets printed as "Attempt 1"
                val pseudoCode = activityCode.copyParts(attemptNumber = nthAttempt + 1)

                val attemptScrambles = scrambleSet.copy(
                    scrambles = scrambles,
                    extraScrambles = listOf(),
                    extensions = scrambleSet.withExtensions(FmcExtension(false), MultiScrambleCountExtension(scrambles.size))
                )

                val attemptRequest = copy(scrambleSet = attemptScrambles, activityCode = pseudoCode)
                attemptRequest.createPdf(creationDate, versionTag, sheetTitle, locale)
            }

            return MergedPdf(singleSheets)
        }

        assert(scrambleSet.scrambles.isNotEmpty())

        if (isFmc) {
            // We don't watermark the FMC sheets because they already have
            // the competition name on them. So we encrypt directly.
            return FmcSolutionSheet(scrambleSet, activityCode, sheetTitle, locale)
        }

        val genericSheet = GeneralScrambleSheet(scrambleSet, activityCode) // encrypt when watermarking
        return WatermarkPdfWrapper(genericSheet, activityCode.compileTitleString(includeGroupID = scrambleSet.hasGroupID), creationDate, versionTag, sheetTitle, watermark)
    }

    fun copyForAttempt(attempt: Int): ScrambleDrawingData {
        val origScrambles = scrambleSet.allScrambles
        val designatedScramble = origScrambles[attempt - 1]

        val modifiedSet = scrambleSet.copy(scrambles = listOf(designatedScramble))

        return copy(scrambleSet = modifiedSet)
    }
}
