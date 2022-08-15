package org.worldcubeassociation.tnoodle.server.pdf.model

import org.worldcubeassociation.tnoodle.core.model.wcif.Scramble
import org.worldcubeassociation.tnoodle.core.model.wcif.ScrambleSet
import org.worldcubeassociation.tnoodle.server.pdf.util.FontUtil
import org.worldcubeassociation.tnoodle.server.pdf.util.ScrambleStringUtil

data class ScrambleRow(
    val scramble: String,
    val index: Int,
    val isExtra: Boolean,
    val rawTokens: List<String>,
    val paddedTokens: List<List<String>>
) {
    companion object {
        private fun List<Scramble>.toRows(isExtra: Boolean): List<ScrambleRow> {
            return mapIndexed { i, scr ->
                val rawTokens = ScrambleStringUtil.split(scr.scrambleString)

                val labelledTokens = ScrambleStringUtil.splitToTokens(scr.scrambleString)
                val tokenChunks = FontUtil.splitAtPossibleBreaks(labelledTokens)

                ScrambleRow(scr.scrambleString, i, isExtra, rawTokens, tokenChunks)
            }
        }

        fun rowsFromScrambleSet(scrambleSet: ScrambleSet): List<ScrambleRow> {
            val standard = scrambleSet.scrambles.toRows(false)
            val extra = scrambleSet.extraScrambles.toRows(true)

            return standard + extra
        }
    }
}
