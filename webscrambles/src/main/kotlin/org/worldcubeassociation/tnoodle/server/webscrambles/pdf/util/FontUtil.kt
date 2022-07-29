package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util

import com.itextpdf.io.font.FontProgram
import com.itextpdf.io.font.PdfEncodings
import com.itextpdf.kernel.font.PdfFont
import com.itextpdf.kernel.font.PdfFontFactory
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Font
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Paper
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.util.StringUtil.stripNewlines
import kotlin.math.abs
import kotlin.math.min

object FontUtil {
    private val FONT_PROGRAM_CACHE = mutableMapOf<String, PdfFont>()

    private const val FLOAT_EPSILON = 0.0001f

    fun Float.epsilonEqual(f: Float): Boolean {
        return abs(this - f) < FLOAT_EPSILON
    }

    fun computeFontScale(text: String, fontName: String, bbRelativeWidth: Float): Float {
        val font = FONT_PROGRAM_CACHE.getOrPut(fontName) {
            PdfFontFactory.createFont("fonts/$fontName.ttf", PdfEncodings.IDENTITY_H)
        }

        val textWidth = font.getWidth(text)
        val coefficient = bbRelativeWidth * FontProgram.UNITS_NORMALIZATION / textWidth

        return min(1f, coefficient)
    }

    fun computeOptimalOneLineFontSize(
        content: String,
        height: Float,
        width: Float,
        fontName: String,
        unitToInches: Float = 1f
    ): Float {
        val optimalFontScale = computeFontScale(content, fontName, width / height)
        return optimalFontScale * unitToInches * height * Paper.DPI
    }

    fun generatePhrase(
        scramble: String,
        isExtra: Boolean,
        boxHeight: Float,
        boxWidth: Float,
        baseUnit: Float
    ): ScramblePhrase {
        // at first, try one-line (silly for big events but not computation-intensive at all)
        val oneLineScramble = ScramblePhrase.NBSP_STRING + scramble + ScramblePhrase.NBSP_STRING
        // TODO magic number same as genericSheet phrase computation
        val oneLineFontSize = computeOptimalOneLineFontSize(oneLineScramble, boxHeight, boxWidth * 0.95f, Font.MONO, baseUnit)

        // can we fit the entire scramble on one line without making it terribly small
        if (oneLineFontSize > ScramblePhrase.MIN_ONE_LINE_FONT_SIZE) {
            // if the scramble ends up on one line, there's no need for padding individual moves
            val oneLineRawTokens = scramble.stripNewlines().split(" ")
            val oneLineChunksWithFlags = oneLineRawTokens.map { it to false }

            return ScramblePhrase(scramble, isExtra, oneLineChunksWithFlags, listOf(oneLineRawTokens), oneLineFontSize)
        }

        val chunksWithBreakFlags = ScramblePhrase.splitToChunks(scramble)

        val phraseChunks = splitAtPossibleBreaks(chunksWithBreakFlags)
        val lineTokens = splitToLines(phraseChunks, boxHeight, boxWidth)

        // TODO does this magical calculation work?
        val lineHeight = boxHeight / lineTokens.size

        val multiLineFontSize = lineTokens
            .map { it.joinToString(" ") }
            .minOf { computeOptimalOneLineFontSize(it, lineHeight, boxWidth, Font.MONO, baseUnit) }

        if (multiLineFontSize > ScramblePhrase.MAX_PHRASE_FONT_SIZE) {
            val maxLineTokens = splitToFixedSizeLines(phraseChunks, ScramblePhrase.MAX_PHRASE_FONT_SIZE, boxWidth, baseUnit)
            return ScramblePhrase(scramble, isExtra, chunksWithBreakFlags, maxLineTokens, ScramblePhrase.MAX_PHRASE_FONT_SIZE)
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
        boxWidth: Float,
        baseUnit: Float
    ): List<List<String>> {
        val relWidthMaxFont = boxWidth * baseUnit * Paper.DPI / fontSize
        return splitCurrentToLines(phraseChunks, relWidthMaxFont)
    }

    private tailrec fun splitToLines(
        chunkSections: List<List<String>>,
        boxHeight: Float,
        boxWidth: Float,
        nLines: Int = 2
    ): List<List<String>> {
        if (nLines > chunkSections.size) {
            return chunkSections
        }

        val singleLineHeight = boxHeight / nLines
        val boxRelativeWidth = boxWidth / singleLineHeight

        val splitCurrentLines = splitCurrentToLines(chunkSections, boxRelativeWidth)

        if (splitCurrentLines.size <= nLines) {
            return splitCurrentLines
        }

        return splitToLines(chunkSections, boxHeight, boxWidth, nLines + 1)
    }

    private tailrec fun splitCurrentToLines(
        chunksSections: List<List<String>>,
        boxRelativeWidth: Float,
        accu: List<List<String>> = emptyList()
    ): List<List<String>> {
        if (chunksSections.isEmpty()) {
            return accu
        }

        val (candidateLine, rest) = takeChunksThatFitOneLine(chunksSections, boxRelativeWidth, ScramblePhrase.NBSP_STRING)

        val currentLine = candidateLine.ifEmpty {
            chunksSections.first().toMutableList().apply { add(0, ScramblePhrase.NBSP_STRING) }
        }

        val actRest = if (candidateLine.isEmpty()) chunksSections.drop(1) else rest

        return splitCurrentToLines(actRest, boxRelativeWidth, merge(accu, currentLine))
    }

    private tailrec fun takeChunksThatFitOneLine(
        chunkSections: List<List<String>>,
        boxRelativeWidth: Float,
        lineEndPadding: String? = null,
        currentAccu: List<String> = listOfNotNull(lineEndPadding)
    ): Pair<List<String>, List<List<String>>> {
        if (chunkSections.isEmpty()) {
            return currentAccu to emptyList()
        }

        val nextAccu = currentAccu + chunkSections.first()
        val joinedChunk = nextAccu.joinToString(" ")

        val nextChunkFontScale = computeFontScale(joinedChunk, Font.MONO, boxRelativeWidth)

        // fontScale is by definition never more than 1 so checking for "not equal" suffices.
        if (!nextChunkFontScale.epsilonEqual(1f)) {
            // the next chunk does NOT fit on the line anymore.
            if (lineEndPadding != null) {
                val paddedAccu = currentAccu + lineEndPadding
                val paddedChunk = paddedAccu.joinToString(" ")

                // prevent situations where we fill an entire line only with padding
                val onlyPadding = paddedAccu.all { it == lineEndPadding }

                if (onlyPadding) {
                    return emptyList<String>() to chunkSections
                }

                val paddedFontScale = computeFontScale(paddedChunk, Font.MONO, boxRelativeWidth)

                if (paddedFontScale.epsilonEqual(1f)) {
                    // Top version: pad at most once. Bottom version: pad as much as possible.
                    // return paddedAccu to chunkSections
                    return takeChunksThatFitOneLine(chunkSections, boxRelativeWidth, lineEndPadding, paddedAccu)
                }
            }

            return currentAccu to chunkSections
        }

        val tail = chunkSections.drop(1)
        return takeChunksThatFitOneLine(tail, boxRelativeWidth, lineEndPadding, nextAccu)
    }

    tailrec fun splitAtPossibleBreaks(
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
