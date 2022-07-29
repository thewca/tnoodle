package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util

import com.itextpdf.io.font.FontProgram
import com.itextpdf.io.font.PdfEncodings
import com.itextpdf.kernel.font.PdfFont
import com.itextpdf.kernel.font.PdfFontFactory
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Font
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Paper
import kotlin.math.min

object FontUtil {
    private val FONT_PROGRAM_CACHE = mutableMapOf<String, PdfFont>()

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
        relativeWidth: Float,
        fontName: String,
        unitToInches: Float = 1f
    ): Float {
        val optimalFontScale = computeFontScale(content, fontName, relativeWidth)
        return optimalFontScale * unitToInches * Paper.DPI
    }

    fun computeOptimalOneLineFontSize(
        content: String,
        height: Float,
        width: Float,
        fontName: String,
        unitToInches: Float = 1f
    ): Float {
        return computeOptimalOneLineFontSize(content, width / height, fontName, unitToInches * height)
    }

    fun generatePhrase(scramble: String, boxHeight: Float, boxWidth: Float, baseUnit: Float): ScramblePhrase {
        val chunksWithBreakFlags = ScramblePhrase.splitToChunks(scramble)

        val oneLineScramble = chunksWithBreakFlags.joinToString(" ") { it.first }
        val oneLineFontSize = computeOptimalOneLineFontSize(oneLineScramble, boxHeight, boxWidth, Font.MONO, baseUnit)

        if (oneLineFontSize > ScramblePhrase.MIN_ONE_LINE_FONT_SIZE) {
            // we can fit the entire scramble on one line without making it terribly small
            val oneLineTokens = chunksWithBreakFlags.map { it.first }
            return ScramblePhrase(scramble, chunksWithBreakFlags, listOf(oneLineTokens), oneLineFontSize)
        }

        val phraseChunks = splitAtPossibleBreaks(chunksWithBreakFlags)
        val lineTokens = splitToLines(phraseChunks, boxHeight, boxWidth)

        // TODO does this magical calculation work?
        val lineHeight = boxHeight / lineTokens.size

        val multiLineFontSize = lineTokens.minOf {
            val lineRaw = it.joinToString(" ")
            computeOptimalOneLineFontSize(lineRaw, lineHeight, boxWidth, Font.MONO, baseUnit)
        }

        if (multiLineFontSize > ScramblePhrase.MAX_PHRASE_FONT_SIZE) {
            val maxLineTokens = splitToFixedSizeLines(phraseChunks, ScramblePhrase.MAX_PHRASE_FONT_SIZE, boxWidth, baseUnit)
            return ScramblePhrase(scramble, chunksWithBreakFlags, maxLineTokens, ScramblePhrase.MAX_PHRASE_FONT_SIZE)
        }

        return ScramblePhrase(scramble, chunksWithBreakFlags, lineTokens, multiLineFontSize)
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

        val (currentLine, actRest) = if (candidateLine.isEmpty()) {
            val nextFullPhrase = chunksSections.first()
            val remainder = chunksSections.drop(nextFullPhrase.size)

            nextFullPhrase to remainder
        } else {
            candidateLine to rest
        }

        // FIXME for some reason, Kotlin cannot resolve the `plus` operator correctly :(
        val newAccu = accu.toMutableList().apply { add(currentLine) }

        return splitCurrentToLines(actRest, boxRelativeWidth, newAccu)
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

        if (computeFontScale(joinedChunk, Font.MONO, boxRelativeWidth) < 1f) {
            if (lineEndPadding != null) {
                val paddedAccu = currentAccu + lineEndPadding
                val paddedChunk = paddedAccu.joinToString(" ")

                // prevent situations where we fill an entire line only with padding
                val onlyPadding = paddedAccu.all { it == lineEndPadding }

                if (onlyPadding) {
                    return emptyList<String>() to chunkSections
                }

                if (computeFontScale(paddedChunk, Font.MONO, boxRelativeWidth) == 1f) {
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
            return accu
        }

        val head = chunksWithBreakFlags.first()
        val tail = chunksWithBreakFlags.drop(1)

        val phrase = currentPhraseAccu + head.first

        val (nextPhraseAccu, nextAccu) = if (head.second) {
            val newAccu = accu.toMutableList().apply { add(phrase) }

            emptyList<String>() to newAccu
        } else {
            phrase to accu
        }

        return splitAtPossibleBreaks(tail, nextPhraseAccu, nextAccu)
    }
}
