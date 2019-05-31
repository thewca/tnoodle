package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util

import com.itextpdf.text.Chunk
import com.itextpdf.text.Font
import com.itextpdf.text.Rectangle
import java.util.LinkedList

object PdfUtil {
    const val NON_BREAKING_SPACE = '\u00A0'
    const val TEXT_PADDING_HORIZONTAL = 1

    fun String.splitToLineChunks(font: Font, textColumnWidth: Float): LinkedList<Chunk> {
        val availableTextWidth = textColumnWidth - 2 * TEXT_PADDING_HORIZONTAL

        val lineChunks = LinkedList<Chunk>()
        val lineList = split("\n".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()

        for (line in lineList) {
            var startIndex = 0
            var endIndex = 0
            while (startIndex < line.length) {
                // Walk forwards until we've grabbed the maximum number of characters
                // that fit in a line or we've run out of characters.
                var substringWidth: Float
                endIndex++
                while (endIndex <= line.length) {
                    val substring = NON_BREAKING_SPACE + line.substring(startIndex, endIndex) + NON_BREAKING_SPACE
                    substringWidth = font.baseFont.getWidthPoint(substring, font.size)
                    if (substringWidth > availableTextWidth) {
                        break
                    }
                    endIndex++
                }
                // endIndex is one past the best fit, so remove one character and it should fit!
                endIndex--

                // If we're not at the end of the text, make sure we're not cutting
                // a word (or turn) in half by walking backwards until we're right before a turn.
                // Any spaces added for padding after a turn are considered part of
                // that turn because they're actually NON_BREAKING_SPACE, not a ' '.
                val perfectFitEndIndex = endIndex
                if (endIndex < line.length) {
                    while (true) {
                        if (endIndex < startIndex) {
                            // We walked all the way to the beginning of the line
                            // without finding a good breaking point. Give up and break
                            // in the middle of a word =(.
                            endIndex = perfectFitEndIndex
                            break
                        }

                        // Another dirty hack for sq1: turns only line up
                        // nicely if every line starts with a (x,y). We ensure this
                        // by forcing every line to end with a /.
                        val isSquareOne = line.indexOf('/') >= 0
                        if (isSquareOne) {
                            val previousCharacter = line[endIndex - 1]
                            if (previousCharacter == '/') {
                                break
                            }
                        } else {
                            val currentCharacter = line[endIndex]
                            val isTurnCharacter = currentCharacter != ' '
                            if (!isTurnCharacter) {
                                break
                            }
                        }
                        endIndex--
                    }
                }

                var substring = NON_BREAKING_SPACE + line.substring(startIndex, endIndex) + NON_BREAKING_SPACE

                // Add NON_BREAKING_SPACE until the substring takes up as much as
                // space as is available on a line.
                do {
                    substring += NON_BREAKING_SPACE
                    substringWidth = font.baseFont.getWidthPoint(substring, font.size)
                } while (substringWidth <= availableTextWidth)
                // substring is now too big for our line, so remove the
                // last character.
                substring = substring.substring(0, substring.length - 1)

                // Walk past all whitespace that comes immediately after the line wrap
                // we are about to insert.
                while (endIndex < line.length && line[endIndex] == ' ') {
                    endIndex++
                }
                startIndex = endIndex
                val lineChunk = Chunk(substring)
                lineChunks.add(lineChunk)
                lineChunk.font = font

                // Force a line wrap!
                lineChunk.append("\n")
            }
        }

        return lineChunks
    }

    /**
     * Copied from ColumnText.java in the itextpdf 5.3.0 source code.
     * Added the newlinesAllowed argument.
     *
     * Fits the text to some rectangle adjusting the font size as needed.
     * @param font the font to use
     * @param text the text
     * @param rect the rectangle where the text must fit
     * @param maxFontSize the maximum font size
     * @param newlinesAllowed output text can be split into lines
     * @param leadingMultiplier leading multiplier between lines
     * @return the calculated font size that makes the text fit
     */
    private val FITTEXT_FONTSIZE_PRECISION = 0.1f

    fun fitText(font: Font, text: String, rect: Rectangle, maxFontSize: Float, newlinesAllowed: Boolean, leadingMultiplier: Float): Float {
        var maxFontSize = maxFontSize

        // ideally, we could pass the object in which our text is going to be rendered
        // as argument instead of asking leadingMultiplier, but we are currently rendering
        // text in pdfcell, columntext and others
        // it'd be painful to render lines in a common object to ask leadingMultiplier

        var minFontSize = 1f
        var potentialFontSize: Float

        while (true) {
            potentialFontSize = (maxFontSize + minFontSize) / 2.0f
            font.size = potentialFontSize

            val lineChunks = text.splitToLineChunks(font, rect.width)
            if (!newlinesAllowed && lineChunks.size > 1) {
                // If newlines are not allowed, and we had to split the text into more than
                // one line, then potentialFontSize is too large.
                maxFontSize = potentialFontSize
            } else {
                // The font size seems to be a pretty good estimate for how
                // much vertical space a row actually takes up.

                val totalHeight = lineChunks.size.toFloat() * potentialFontSize * leadingMultiplier

                if (totalHeight < rect.height) {
                    minFontSize = potentialFontSize
                } else {
                    maxFontSize = potentialFontSize
                }
            }
            if (maxFontSize - minFontSize < FITTEXT_FONTSIZE_PRECISION) {
                // Err on the side of too small, because being too large will screw up
                // layout.
                potentialFontSize = minFontSize
                break
            }
        }
        return potentialFontSize
    }
}
