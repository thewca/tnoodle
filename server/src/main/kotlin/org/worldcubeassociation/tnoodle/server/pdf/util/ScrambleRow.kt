package org.worldcubeassociation.tnoodle.server.pdf.util

import org.worldcubeassociation.tnoodle.server.wcif.model.Scramble
import org.worldcubeassociation.tnoodle.server.wcif.model.ScrambleSet

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
