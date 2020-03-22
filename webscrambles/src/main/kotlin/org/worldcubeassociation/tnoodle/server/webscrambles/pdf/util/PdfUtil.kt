package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util

import com.itextpdf.text.Chunk
import com.itextpdf.text.Font
import com.itextpdf.text.Rectangle

object PdfUtil {
    private const val NON_BREAKING_SPACE = '\u00A0'
    private const val TEXT_PADDING_HORIZONTAL = 1

    fun String.splitToLineChunks(font: Font, textColumnWidth: Float): List<Chunk> {
        val availableTextWidth = textColumnWidth - 2 * TEXT_PADDING_HORIZONTAL

        val padded = StringUtil.padTurnsUniformly(this, NON_BREAKING_SPACE.toString())

        return padded.split("\n").dropLastWhile { it.isEmpty() }
            .flatMap { it.splitLineToChunks(font, availableTextWidth) }
            .map { it.toLineWrapChunk(font) }
    }

    private tailrec fun String.splitLineToChunks(font: Font, availableTextWidth: Float, acc: List<String> = listOf()): List<String> {
        if (isEmpty()) {
            return acc
        }

        // Walk past all whitespace that comes immediately after
        // the last line wrap we just inserted.
        if (first() == ' ') {
            return drop(1)
                .splitLineToChunks(font, availableTextWidth, acc)
        }

        val optimalCutIndex = optimalCutIndex(font, availableTextWidth)

        val substring = substring(0, optimalCutIndex).padNbsp()
            .fillToWidthMax(NON_BREAKING_SPACE.toString(), font, availableTextWidth)

        return substring(optimalCutIndex)
            .splitLineToChunks(font, availableTextWidth, acc + substring)
    }

    private fun String.padNbsp() = NON_BREAKING_SPACE + this + NON_BREAKING_SPACE

    fun String.optimalCutIndex(font: Font, availableTextWidth: Float): Int {
        val endIndex = longestFittingSubstringIndex(font, availableTextWidth, 0)

        // If we're not at the end of the text, make sure we're not cutting
        // a word (or turn) in half by walking backwards until we're right before a turn.
        if (endIndex < length) {
            return tryBackwardsWordEndIndex(endIndex)
        }

        return endIndex
    }

    fun String.longestFittingSubstringIndex(font: Font, maxWidth: Float, fallback: Int): Int {
        val searchRange = 0..length

        val endpoint = searchRange.findLast {
            val substring = substring(0, it).padNbsp()
            val substringWidth = font.baseFont.getWidthPoint(substring, font.size)

            substringWidth <= maxWidth
        }

        return endpoint ?: fallback
    }

    fun String.tryBackwardsWordEndIndex(endIndex: Int = lastIndex, fallback: Int = endIndex): Int {
        for (perfectFitIndex in endIndex downTo 0) {
            // Another dirty hack for sq1: turns only line up
            // nicely if every line starts with a (x,y). We ensure this
            // by forcing every line to end with a /.
            val isSquareOne = "/" in this

            // Any spaces added for padding after a turn are considered part of
            // that turn because they're actually NON_BREAKING_SPACE, not a ' '.
            val terminatingChar = if (isSquareOne) '/' else ' '
            val indexBias = if (isSquareOne) 1 else 0

            if (this[perfectFitIndex - indexBias] == terminatingChar) {
                return perfectFitIndex
            }
        }

        // We walked all the way to the beginning of the line
        // without finding a good breaking point.
        // Give up and break in the middle of a word =(.
        return fallback
    }

    tailrec fun String.fillToWidthMax(padding: String, font: Font, maxLength: Float): String {
        // Add $padding until the substring takes up as much space as is available on a line.
        val paddedString = this + padding
        val substringWidth = font.baseFont.getWidthPoint(paddedString, font.size)

        if (substringWidth > maxLength) {
            // substring is now too big for our line, so remove the last character.
            return this
        }

        return paddedString.fillToWidthMax(padding, font, maxLength)
    }

    fun String.toLineWrapChunk(font: Font) = Chunk(this).apply {
        this.font = font

        // Force a line wrap!
        append("\n")
    }

    private val FITTEXT_FONTSIZE_PRECISION = 0.1f

    /**
     * Adapted from ColumnText.java in the itextpdf 5.3.0 source code.
     * Added the newlinesAllowed argument.
     *
     * Fits the text to some rectangle adjusting the font size as needed.
     * @param font the font to use
     * @param text the text
     * @param availableArea the rectangle where the text must fit
     * @param maxFontSize the maximum font size
     * @param newlinesAllowed output text can be split into lines
     * @param leadingMultiplier leading multiplier between lines
     *
     * @return the calculated font size that makes the text fit
     */
    fun fitText(font: Font, text: String, availableArea: Rectangle, maxFontSize: Float, newlinesAllowed: Boolean, leadingMultiplier: Float = 1f): Float {
        return binarySearchDec(1f, maxFontSize, FITTEXT_FONTSIZE_PRECISION) {
            // FIXME inplace modification is no good
            font.size = it

            val lineChunks = text.splitToLineChunks(font, availableArea.width)

            // The font size seems to be a pretty good estimate for how
            // much vertical space a row actually takes up.
            val heightPerLine = it * leadingMultiplier
            val totalHeight = lineChunks.size.toFloat() * heightPerLine

            val shouldDecrease = totalHeight > availableArea.height
            // If newlines are NOT allowed, but we had to split the text into more than
            // one line, then our current guess is too large.
            val mustDecrease = !newlinesAllowed && lineChunks.size > 1

            shouldDecrease || mustDecrease
        }
    }

    tailrec fun binarySearchDec(min: Float, max: Float, precision: Float, shouldDecrease: (Float) -> Boolean): Float {
        if (max - min < precision) {
            // Ground recursion: We have converged arbitrarily close to some target value.
            return min
        }

        val potentialFontSize = (min + max) / 2f
        val iterationShouldDecrease = shouldDecrease(potentialFontSize)

        return if (iterationShouldDecrease) {
            binarySearchDec(min, potentialFontSize, precision, shouldDecrease)
        } else {
            binarySearchDec(potentialFontSize, max, precision, shouldDecrease)
        }
    }
}
