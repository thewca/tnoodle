package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util

import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Font

data class ScramblePhrase(
    val row: ScrambleRow,
    val lines: List<String>,
    val fontSize: Float
) {
    companion object {
        const val DEFAULT_FONT = Font.MONO
        const val DEFAULT_GLUE = ScrambleStringUtil.MOVES_DELIMITER
        val DEFAULT_PADDING = ScrambleStringUtil.NBSP_STRING

        fun fromScrambleRow(
            row: ScrambleRow,
            boxHeight: Float,
            boxWidth: Float,
            unitToInches: Float = 1f,
            leading: Float = Font.Leading.DEFAULT
        ): ScramblePhrase {
            // at first, try one-line (silly for big events but not computation-intensive at all)
            val oneLineScramble = DEFAULT_PADDING + row.scramble + DEFAULT_PADDING

            // ignore leading between lines because we're deliberately trying for one line only
            val oneLineFontSize = FontUtil.computeOneLineFontSize(
                oneLineScramble,
                boxHeight,
                boxWidth,
                DEFAULT_FONT,
                unitToInches,
                1f // deliberately ignore leading because we aim for one single line anyway.
            )

            // can we fit the entire scramble on one line without making it terribly small?
            if (oneLineFontSize > ScrambleStringUtil.MIN_ONE_LINE_FONT_SIZE) {
                // if the scramble ends up on one line, there's no need for padding individual moves
                return ScramblePhrase(row, listOf(row.scramble), oneLineFontSize)
            }

            val lineTokens = FontUtil.splitToMaxFontSizeLines(
                row.paddedTokens,
                boxHeight,
                boxWidth,
                leading,
                DEFAULT_GLUE,
                DEFAULT_PADDING
            )

            // leading is considered further down
            val lineHeight = boxHeight / lineTokens.size

            val multiLineFontSize = lineTokens
                .minOf { FontUtil.computeOneLineFontSize(it, lineHeight, boxWidth, DEFAULT_FONT, unitToInches, leading) }

            if (multiLineFontSize > ScrambleStringUtil.MAX_PHRASE_FONT_SIZE) {
                val maxLineTokens = FontUtil.splitToFixedSizeLines(
                    row.paddedTokens,
                    ScrambleStringUtil.MAX_PHRASE_FONT_SIZE,
                    boxWidth,
                    unitToInches,
                    DEFAULT_GLUE,
                    DEFAULT_PADDING
                )

                return ScramblePhrase(row, maxLineTokens, ScrambleStringUtil.MAX_PHRASE_FONT_SIZE)
            }

            return ScramblePhrase(row, lineTokens, multiLineFontSize)
        }
    }
}
