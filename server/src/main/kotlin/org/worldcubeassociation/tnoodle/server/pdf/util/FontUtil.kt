package org.worldcubeassociation.tnoodle.server.pdf.util

import com.itextpdf.io.font.FontProgram
import com.itextpdf.io.font.PdfEncodings
import com.itextpdf.kernel.font.PdfFont
import com.itextpdf.kernel.font.PdfFontFactory
import com.itextpdf.layout.renderer.TextRenderer
import org.worldcubeassociation.tnoodle.server.pdf.model.properties.Font
import org.worldcubeassociation.tnoodle.server.pdf.model.properties.Paper.inchesToPixelPrecise
import kotlin.math.abs
import kotlin.math.max
import kotlin.math.min

object FontUtil {
    private val FONT_PROGRAM_CACHE = mutableMapOf<String, PdfFont>()

    private const val FLOAT_EPSILON = 0.0001f

    private fun Float.epsilonEqual(f: Float): Boolean {
        return abs(this - f) < FLOAT_EPSILON
    }

    private fun computeFontWidthScale(text: String, relativeWidth: Float, fontName: String): Float {
        val font = FONT_PROGRAM_CACHE.getOrPut(fontName) {
            PdfFontFactory.createFont("fonts/$fontName.ttf", PdfEncodings.IDENTITY_H)
        }

        val textWidth = font.getWidth(text) / FontProgram.UNITS_NORMALIZATION.toFloat()
        val coefficient = relativeWidth / textWidth

        return min(1f, coefficient)
    }

    private fun computeFontHeightScale(fontName: String): Float {
        val font = FONT_PROGRAM_CACHE.getOrPut(fontName) {
            PdfFontFactory.createFont("fonts/$fontName.ttf", PdfEncodings.IDENTITY_H)
        }

        val (asc, desc) = TextRenderer.calculateAscenderDescender(font)
        val coefficient = (asc - desc) / FontProgram.UNITS_NORMALIZATION.toFloat()

        return max(1f, coefficient)
    }

    private fun getCalcLeading(leading: Float, fontName: String): Float {
        // leading below 1 won't make the text itself smaller!
        // it will squish the next line over the current one,
        // but we only care about text height here anyway.
        val flatLeading = max(1f, leading)
        val fontLeading = computeFontHeightScale(fontName)

        val largestLeading = max(flatLeading, fontLeading)

        return max(1f, largestLeading)
    }

    fun computeOneLineFontSize(
        content: String,
        height: Float,
        width: Float,
        fontName: String,
        unitToInches: Float = 1f,
        leading: Float = Font.Leading.DEFAULT
    ): Float {
        val relativeWidth = width / height

        val widthScale = computeFontWidthScale(content, relativeWidth, fontName)

        val heightRenderingScale = getCalcLeading(leading, fontName)
        val heightFactor = widthScale * heightRenderingScale
        val heightScale = max(1f, heightFactor)

        return (height * unitToInches * widthScale).inchesToPixelPrecise / heightScale
    }

    fun splitToFixedSizeLines(
        phraseChunks: List<List<String>>,
        fontSize: Float,
        lineWidth: Float,
        unitToInches: Float = 1f,
        chunkGlue: String,
        padding: String? = null,
    ): List<String> {
        val widthInPx = (lineWidth * unitToInches).inchesToPixelPrecise
        val relWidthForFont = widthInPx / fontSize

        val lineTokens = splitChunksToLines(phraseChunks, relWidthForFont, chunkGlue, padding)
        return lineTokens.map { it.joinToStringWithPadding(chunkGlue, padding) }
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

            if (currentPhraseAccu.isNotEmpty()) {
                return accu + listOf(currentPhraseAccu)
            }

            return accu
        }

        val head = chunksWithBreakFlags.first()
        val tail = chunksWithBreakFlags.drop(1)

        val phrase = currentPhraseAccu + head.first

        return if (head.second) {
            // we can split!
            splitAtPossibleBreaks(tail, emptyList(), merge(accu, phrase))
        } else {
            // no split yet, try consuming more tokens
            splitAtPossibleBreaks(tail, phrase, accu)
        }
    }

    tailrec fun splitToMaxFontSizeLines(
        chunkSections: List<List<String>>,
        boxHeight: Float,
        boxWidth: Float,
        leading: Float = Font.Leading.DEFAULT,
        chunkGlue: String,
        padding: String? = null,
        nLines: Int = 2
    ): List<String> {
        if (nLines > chunkSections.size) {
            return chunkSections.map { it.joinToStringWithPadding(chunkGlue, padding) }
        }

        val singleLineHeight = boxHeight / nLines
        val boxRelativeWidth = boxWidth / (singleLineHeight * getCalcLeading(leading, Font.MONO))

        val splitCurrentLines = splitChunksToLines(chunkSections, boxRelativeWidth, chunkGlue, padding)

        if (splitCurrentLines.size <= nLines) {
            return splitCurrentLines.map { it.joinToStringWithPadding(chunkGlue, padding) }
        }

        return splitToMaxFontSizeLines(chunkSections, boxHeight, boxWidth, leading, chunkGlue, padding, nLines + 1)
    }

    private fun <T> List<T>.joinToStringWithPadding(
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

    private fun <T> merge(accu: List<List<T>>, element: List<T>): List<List<T>> {
        // FIXME for some reason, Kotlin cannot resolve the `plus` operator correctly :(
        return accu.toMutableList().apply { add(element) }
    }

    private tailrec fun splitChunksToLines(
        chunks: List<List<String>>,
        lineRelWidth: Float,
        chunkGlue: String,
        padding: String? = null,
        accu: List<List<String>> = emptyList()
    ): List<List<String>> {
        if (chunks.isEmpty()) {
            return accu
        }

        val (candidateLine, rest) = takeChunksThatFitOneLine(chunks, lineRelWidth, chunkGlue, padding)

        return if (candidateLine.isEmpty()) {
            val nextLine = listOfNotNull(padding) + chunks.first() + listOfNotNull(padding)
            val remainingChunks = chunks.drop(1)

            splitChunksToLines(remainingChunks, lineRelWidth, chunkGlue, padding, merge(accu, nextLine))
        } else {
            splitChunksToLines(rest, lineRelWidth, chunkGlue, padding, merge(accu, candidateLine))
        }
    }

    private tailrec fun takeChunksThatFitOneLine(
        chunkSections: List<List<String>>,
        lineRelativeWidth: Float,
        chunkGlue: String,
        linePadding: String? = null,
        currentAccu: List<String> = listOfNotNull(linePadding)
    ): Pair<List<String>, List<List<String>>> {
        if (chunkSections.isEmpty()) {
            return currentAccu to emptyList()
        }

        val nextAccu = currentAccu + chunkSections.first()

        // local helper function to determine if a temporary working state (accu) fits the current line
        fun accuFits(accu: List<String>): Boolean {
            val lineChunk = accu.joinToStringWithPadding(chunkGlue, linePadding)
            val fontScale = computeFontWidthScale(lineChunk, lineRelativeWidth, Font.MONO)

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
                return takeChunksThatFitOneLine(
                    chunkSections,
                    lineRelativeWidth,
                    chunkGlue,
                    linePadding,
                    paddedExistingAccu
                )
            }

            val paddedNextAccu = nextAccu + linePadding

            if (!accuFits(paddedNextAccu)) {
                // If we haven't even managed to insert one single chunk, give up.
                if (onlyPadding) {
                    return emptyList<String>() to chunkSections
                }

                // we would be able to add a token but then the line is too full to end with padding
                return takeChunksThatFitOneLine(
                    chunkSections,
                    lineRelativeWidth,
                    chunkGlue,
                    linePadding,
                    paddedExistingAccu
                )
            }
        } else if (!accuFits(nextAccu)) {
            // we don't do padding, and we're not able to fill more chunks
            return currentAccu to chunkSections
        }

        // we consumed one chunk of tokens!
        val tail = chunkSections.drop(1)

        return takeChunksThatFitOneLine(tail, lineRelativeWidth, chunkGlue, linePadding, nextAccu)
    }
}
