package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util

import com.itextpdf.io.font.FontProgram
import com.itextpdf.io.font.PdfEncodings
import com.itextpdf.kernel.font.PdfFont
import com.itextpdf.kernel.font.PdfFontFactory
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Font
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Paper.inchesToPixelPrecise
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.util.StringUtil.stripNewlines
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min

object FontUtil {
    private val FONT_PROGRAM_CACHE = mutableMapOf<String, PdfFont>()

    private const val FLOAT_EPSILON = 0.0001f

    private fun Float.epsilonEqual(f: Float): Boolean {
        return abs(this - f) < FLOAT_EPSILON
    }

    private fun computeFontScale(text: String, relativeWidth: Float, fontName: String): Float {
        val font = FONT_PROGRAM_CACHE.getOrPut(fontName) {
            PdfFontFactory.createFont("fonts/$fontName.ttf", PdfEncodings.IDENTITY_H)
        }

        val textWidth = font.getWidth(text)
        val coefficient = relativeWidth * FontProgram.UNITS_NORMALIZATION / textWidth

        return min(1f, coefficient)
    }

    private fun computeRelativeWidth(
        height: Float,
        width: Float,
        leading: Float = Font.Leading.DEFAULT
    ): Float {
        return width / (height * getCalcLeading(leading))
    }

    private fun getCalcLeading(leading: Float): Float {
        // leading below 1 won't make the text itself smaller!
        // it will squish the next line over the current one,
        // but we only care about text height here anyway.
        return max(1f, leading)
    }

    fun computeOneLineFontSize(
        content: String,
        height: Float,
        width: Float,
        fontName: String,
        unitToInches: Float = 1f,
        leading: Float = Font.Leading.DEFAULT
    ): Float {
        val relativeWidth = computeRelativeWidth(height, width, leading)

        val optimalFontScale = computeFontScale(content, relativeWidth, fontName)
        val calcLeading = getCalcLeading(leading)

        return (height * unitToInches * optimalFontScale).inchesToPixelPrecise / calcLeading
    }

    fun generatePhrase(
        scramble: String,
        isExtra: Boolean,
        boxHeight: Float,
        boxWidth: Float,
        unitToInches: Float = 1f,
        leading: Float = Font.Leading.DEFAULT
    ): ScramblePhrase {
        // at first, try one-line (silly for big events but not computation-intensive at all)
        val oneLineScramble = ScramblePhrase.NBSP_STRING + scramble + ScramblePhrase.NBSP_STRING
        // ignore leading between lines because we're deliberately trying for one line only
        val oneLineFontSize = computeOneLineFontSize(oneLineScramble, boxHeight, boxWidth, Font.MONO, unitToInches, 1f)

        val chunksWithBreakFlags = ScramblePhrase.splitToChunks(scramble)

        // can we fit the entire scramble on one line without making it terribly small
        if (oneLineFontSize > ScramblePhrase.MIN_ONE_LINE_FONT_SIZE) {
            // if the scramble ends up on one line, there's no need for padding individual moves
            val oneLineRawTokens = oneLineScramble.stripNewlines().split(" ")

            return ScramblePhrase(scramble, isExtra, chunksWithBreakFlags, listOf(oneLineRawTokens), oneLineFontSize)
        }

        val phraseChunks = splitAtPossibleBreaks(chunksWithBreakFlags)
        val lineTokens = splitToMaxFontSizeLines(phraseChunks, boxHeight, boxWidth, leading) // no padding on purpose

        // leading is considered further down
        val lineHeight = boxHeight / lineTokens.size

        val multiLineFontSize = lineTokens
            .map { it.joinToStringWithPadding(" ", ScramblePhrase.NBSP_STRING) }
            .minOf { computeOneLineFontSize(it, lineHeight, boxWidth, Font.MONO, unitToInches, leading) }

        if (multiLineFontSize > ScramblePhrase.MAX_PHRASE_FONT_SIZE) {
            val maxLineTokens = splitToFixedSizeLines(
                phraseChunks,
                ScramblePhrase.MAX_PHRASE_FONT_SIZE,
                boxWidth,
                unitToInches,
                ScramblePhrase.NBSP_STRING
            )

            return ScramblePhrase(
                scramble,
                isExtra,
                chunksWithBreakFlags,
                maxLineTokens,
                ScramblePhrase.MAX_PHRASE_FONT_SIZE
            )
        }

        return ScramblePhrase(scramble, isExtra, chunksWithBreakFlags, lineTokens, multiLineFontSize)
    }

    private fun <T> merge(accu: List<List<T>>, element: List<T>): List<List<T>> {
        // FIXME for some reason, Kotlin cannot resolve the `plus` operator correctly :(
        return accu.toMutableList().apply { add(element) }
    }

    fun splitToFixedSizeLines(
        phraseChunks: List<List<String>>,
        fontSize: Float,
        lineWidth: Float,
        unitToInches: Float = 1f,
        padding: String? = null,
    ): List<List<String>> {
        val widthInPx = (lineWidth * unitToInches).inchesToPixelPrecise
        val relWidthForFont = widthInPx / fontSize

        return splitChunksToLines(phraseChunks, relWidthForFont, padding)
    }

    private fun splitToMaxFontSizeLines(
        chunkSections: List<List<String>>,
        boxHeight: Float,
        boxWidth: Float,
        leading: Float = Font.Leading.DEFAULT,
        padding: String? = null,
        nLines: Int = 2
    ): List<List<String>> {
        if (nLines > chunkSections.size) {
            return chunkSections
        }

        val singleLineHeight = boxHeight / nLines
        val boxRelativeWidth = computeRelativeWidth(singleLineHeight, boxWidth, leading)

        val splitCurrentLines = splitChunksToLines(chunkSections, boxRelativeWidth, padding)

        if (splitCurrentLines.size <= nLines) {
            return splitCurrentLines
        }

        return splitToMaxFontSizeLines(chunkSections, boxHeight, boxWidth, leading, padding, nLines + 1)
    }

    private fun splitChunksToLines(
        chunks: List<List<String>>,
        lineRelWidth: Float,
        padding: String? = null,
        accu: List<List<String>> = emptyList()
    ): List<List<String>> {
        if (chunks.isEmpty()) {
            return accu
        }

        val (candidateLine, rest) = takeChunksThatFitOneLine(chunks, lineRelWidth, padding)

        val currentLine = candidateLine.ifEmpty {
            chunks.first().toMutableList().apply {
                if (padding != null) {
                    // pad beginning
                    add(0, padding)

                    // pad end
                    add(padding)
                }
            }
        }

        val actRest = if (candidateLine.isEmpty()) chunks.drop(1) else rest

        return splitChunksToLines(actRest, lineRelWidth, padding, merge(accu, currentLine))
    }

    fun <T> List<T>.joinToStringWithPadding(
        glue: String,
        padding: T? = null
    ): String {
        val prefix = takeWhile { it == padding }
            .joinToString("")
        val suffix = takeLastWhile { it == padding }
            .joinToString("")

        val content = drop(prefix.length)
            .dropLast(suffix.length)
            .joinToString(glue)

        return prefix + content + suffix
    }

    private fun takeChunksThatFitOneLine(
        chunkSections: List<List<String>>,
        lineRelativeWidth: Float,
        linePadding: String? = null,
        currentAccu: List<String> = listOfNotNull(linePadding)
    ): Pair<List<String>, List<List<String>>> {
        if (chunkSections.isEmpty()) {
            return currentAccu to emptyList()
        }

        val nextAccu = currentAccu + chunkSections.first()

        // local helper function to determine if a temporary working state (accu) fits the current line
        fun accuFits(accu: List<String>): Boolean {
            val lineChunk = accu.joinToStringWithPadding(" ", linePadding)
            val fontScale = computeFontScale(lineChunk, lineRelativeWidth, Font.MONO)

            // if we have to scale the line down (scale < 1), it means it does NOT fit.
            // fontScale is by definition never more than 1 so checking for equality suffices.
            return fontScale.epsilonEqual(1f)
        }

        // unfortunately, padding is complicated. :(
        if (linePadding != null) {
            // prevent situations where we fill an entire line only with padding
            val onlyPadding = currentAccu.all { it == linePadding }

            val paddedExistingAccu = currentAccu + linePadding

            if (!onlyPadding) {
                // make sure we can AT LEAST insert a padding at the end of the line.
                if (!accuFits(paddedExistingAccu)) {
                    // we cannot even insert line end padding. Give up immediately.
                    return currentAccu to chunkSections
                }

                // NOT returning the padded accu even if it fits, because we might end up
                // being able to insert a "real" chunk which is even better than padding.
            }

            if (!accuFits(nextAccu)) {
                // If we haven't even managed to insert one single chunk, give up.
                if (onlyPadding) {
                    return emptyList<String>() to chunkSections
                }

                // we know for sure that we can fit at least the padding, because we've tried that at the beginning.
                // Two versions how to proceed. Top version: pad at most once. Bottom version: pad as much as possible.

                //return paddedExistingAccu to chunkSections
                return takeChunksThatFitOneLine(chunkSections, lineRelativeWidth, linePadding, paddedExistingAccu)
            }

            val paddedNextAccu = nextAccu + linePadding

            if (!accuFits(paddedNextAccu)) {
                // If we haven't even managed to insert one single chunk, give up.
                if (onlyPadding) {
                    return emptyList<String>() to chunkSections
                }

                // we would be able to add a token but then the line is too full to end with padding
                return takeChunksThatFitOneLine(chunkSections, lineRelativeWidth, linePadding, paddedExistingAccu)
            }
        } else if (!accuFits(nextAccu)) {
            // we don't do padding, and we're not able to fill more chunks
            return currentAccu to chunkSections
        }

        // we consumed one chunk of tokens!
        val tail = chunkSections.drop(1)

        return takeChunksThatFitOneLine(tail, lineRelativeWidth, linePadding, nextAccu)
    }

    fun splitAtPossibleBreaks(
        chunksWithBreakFlags: List<Pair<String, Boolean>>,
        currentPhraseAccu: List<String> = emptyList(),
        accu: List<List<String>> = emptyList()
    ): List<List<String>> {
        if (chunksWithBreakFlags.isEmpty()) {
            if (accu.isEmpty()) {
                // not a single line break in the entire sequence.
                return listOf(currentPhraseAccu)
            }

            return accu
        }

        val head = chunksWithBreakFlags.first()
        val tail = chunksWithBreakFlags.drop(1)

        val phrase = currentPhraseAccu + head.first

        val nextPhraseAccu = if (head.second) emptyList() else phrase
        val nextAccu = if (head.second) merge(accu, phrase) else accu

        return splitAtPossibleBreaks(tail, nextPhraseAccu, nextAccu)
    }
}
