package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.*
import com.itextpdf.text.pdf.PdfContentByte
import com.itextpdf.text.pdf.PdfPCell
import com.itextpdf.text.pdf.PdfPTable
import com.itextpdf.text.pdf.PdfWriter
import net.gnehzr.tnoodle.svglite.Dimension
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.FontUtil
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfDrawUtil.renderSvgToPDF
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfUtil
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfUtil.splitToLineChunks
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.StringUtil
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Activity
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Scramble
import kotlin.math.min

class GeneralScrambleSheet(wcif: Competition, activity: Activity) : BaseScrambleSheet(wcif, activity) {
    override fun PdfWriter.writeContents(document: Document) {
        val pageSize = document.pageSize

        val sideMargins = 100f + document.leftMargin() + document.rightMargin()
        val availableWidth = pageSize.width - sideMargins

        // Yeee magic numbers. This should make space for the headerTable.
        val extraScrambleSpacing = 20.takeIf { scrambleSet.extraScrambles.isNotEmpty() } ?: 0

        val vertMargins = document.topMargin() + document.bottomMargin()
        val availableHeight = pageSize.height - vertMargins - extraScrambleSpacing

        val scramblesPerPage = min(MAX_SCRAMBLES_PER_PAGE, scrambleSet.allScrambles.size)
        val maxScrambleImageHeight = (availableHeight / scramblesPerPage - 2 * SCRAMBLE_IMAGE_PADDING).toInt()

        // We don't let scramble images take up more than half the page
        val maxScrambleImageWidth = (availableWidth / 2).toInt().takeUnless {
            // TODO - If we allow the megaminx image to be too wide, the
            //   Megaminx scrambles get really tiny. This tweak allocates
            //   a more optimal amount of space to the scrambles. This is possible
            //   because the scrambles are so uniformly sized.
            scramblingPuzzle.shortName == "minx"
        } ?: 190

        val scrambleImageSize = scramblingPuzzle.getPreferredSize(maxScrambleImageWidth, maxScrambleImageHeight)

        val indexColumnWidth = availableWidth / INDEX_COLUMN_WIDTH_RATIO
        val scrambleColumnWidth = availableWidth - indexColumnWidth - scrambleImageSize.width.toFloat() - (2 * SCRAMBLE_IMAGE_PADDING).toFloat()

        val allScrambleStrings = scrambleSet.allScrambles.flatMap { it.allScrambleStrings }

        val (scrambleFont, oneLine) = getFontConfiguration(scrambleColumnWidth, scrambleImageSize, allScrambleStrings)
        val useHighlighting = requiresHighlighting(scrambleColumnWidth, allScrambleStrings, scrambleFont, oneLine)

        // First do a dry run just to see if any scrambles require highlighting.
        // Then do the real run, and force highlighting on every scramble
        // if any scramble required it.
        val table = directContent.createTable(scrambleFont, oneLine, scrambleColumnWidth, indexColumnWidth, scrambleImageSize, scrambleSet.scrambles, STD_SCRAMBLE_PREFIX, useHighlighting)
        document.add(table)

        if (scrambleSet.extraScrambles.isNotEmpty()) {
            val headerTable = PdfPTable(1).apply {
                setTotalWidth(floatArrayOf(availableWidth))
                isLockedWidth = true
            }

            val extraScramblesHeader = PdfPCell(Paragraph(TABLE_HEADING_EXTRA_SCRAMBLES)).apply {
                verticalAlignment = PdfPCell.ALIGN_MIDDLE
                paddingBottom = 3f
            }

            headerTable.addCell(extraScramblesHeader)
            document.add(headerTable)

            val extraTable = directContent.createTable(scrambleFont, oneLine, scrambleColumnWidth, indexColumnWidth, scrambleImageSize, scrambleSet.extraScrambles, EXTRA_SCRAMBLE_PREFIX, useHighlighting)
            document.add(extraTable)
        }
    }

    fun getFontConfiguration(scrambleColumnWidth: Float, scrambleImageSize: Dimension, scrambles: List<String>): Pair<Font, Boolean> {
        val availableScrambleHeight = scrambleImageSize.height - 2 * SCRAMBLE_IMAGE_PADDING

        val availableArea = Rectangle(scrambleColumnWidth - 2 * SCRAMBLE_PADDING_HORIZONTAL,
            (availableScrambleHeight - SCRAMBLE_PADDING_VERTICAL_TOP - SCRAMBLE_PADDING_VERTICAL_BOTTOM).toFloat())

        val longestScramble = scrambles.maxBy { it.length } ?: ""

        val longestAlignedScramble = scrambles.map { StringUtil.padTurnsUniformly(it, WIDEST_CHAR_STRING) }
            .maxBy { it.length } ?: longestScramble

        val longestScrambleOneLine = "\n" !in longestAlignedScramble//Masked

        // I don't know how to configure ColumnText.fitText's word wrapping characters,
        // so instead, I just replace each character I don't want to wrap with M, which
        // should be the widest character (we're using a monospaced font,
        // so that doesn't really matter), and won't get wrapped.
        val longestScrambleMasked = longestScramble.replace(".".toRegex(), WIDEST_CHAR_STRING)
        val longestAlignedScrambleMasked = longestAlignedScramble.replace("\\S".toRegex(), WIDEST_CHAR_STRING)
        val longestAlignedScrambleMaskedAndStuffed = longestAlignedScrambleMasked.replace(" ".toRegex(), WIDEST_CHAR_STRING)

        val fontSizeForMaskedUnaligned = PdfUtil.fitText(Font(FontUtil.MONO_FONT), longestScrambleMasked, availableArea, FontUtil.MAX_SCRAMBLE_FONT_SIZE, false, 1f) // FIXME const

        // If the scramble contains newlines, then we *only* allow wrapping at the newlines.
        val longestRespectingNewlines = longestAlignedScrambleMasked.takeIf { longestScrambleOneLine }
            ?: longestAlignedScrambleMaskedAndStuffed
        val fontSizeIfIncludingNewlines = PdfUtil.fitText(Font(FontUtil.MONO_FONT), longestRespectingNewlines, availableArea, FontUtil.MAX_SCRAMBLE_FONT_SIZE, true, 1f) // FIXME const

        val oneLine = longestScrambleOneLine && fontSizeForMaskedUnaligned >= FontUtil.MINIMUM_ONE_LINE_FONT_SIZE
        val perfectFontSize = fontSizeForMaskedUnaligned.takeIf { oneLine } ?: fontSizeIfIncludingNewlines

        return Font(FontUtil.MONO_FONT, perfectFontSize, Font.NORMAL) to oneLine
    }

    fun requiresHighlighting(scrambleColumnWidth: Float, scrambles: List<String>, scrambleFont: Font, oneLine: Boolean): Boolean {
        val paddedScrambles = scrambles.map { if (oneLine) it else StringUtil.padTurnsUniformly(it, PdfUtil.NON_BREAKING_SPACE.toString()) }
        val lineChunks = paddedScrambles.map { it.splitToLineChunks(scrambleFont, scrambleColumnWidth) }

        return lineChunks.any { it.size >= MIN_LINES_TO_ALTERNATE_HIGHLIGHTING }
    }

    private fun PdfContentByte.createTable(scrambleFont: Font, oneLine: Boolean, scrambleColumnWidth: Float, indexColumnWidth: Float, scrambleImageSize: Dimension, scrambles: List<Scramble>, scrambleNumberPrefix: String, useHighlighting: Boolean): PdfPTable {
        val table = PdfPTable(3).apply {
            setTotalWidth(floatArrayOf(indexColumnWidth, scrambleColumnWidth, (scrambleImageSize.width + 2 * SCRAMBLE_IMAGE_PADDING).toFloat()))
            isLockedWidth = true
        }

        val strScrambles = scrambles.flatMap { it.allScrambleStrings }

        for ((i, scramble) in strScrambles.withIndex()) {
            val ch = Chunk("$scrambleNumberPrefix${i + 1}.")
            val nthScramble = PdfPCell(Paragraph(ch)).apply {
                verticalAlignment = PdfPCell.ALIGN_MIDDLE
            }
            table.addCell(nthScramble)

            val paddedScramble = if (oneLine) scramble else StringUtil.padTurnsUniformly(scramble, PdfUtil.NON_BREAKING_SPACE.toString())
            val lineChunks = paddedScramble.splitToLineChunks(scrambleFont, scrambleColumnWidth)
            val scramblePhrase = Phrase()

            for ((nthLine, lineChunk) in lineChunks.withIndex()) {
                if (useHighlighting && nthLine % 2 == 1) {
                    lineChunk.setBackground(HIGHLIGHT_COLOR)
                }

                scramblePhrase.add(lineChunk)
            }

            val scrambleCell = PdfPCell(Paragraph(scramblePhrase)).apply {
                // We carefully inserted newlines ourselves to make stuff fit, don't
                // let itextpdf wrap lines for us.
                isNoWrap = true
                verticalAlignment = PdfPCell.ALIGN_MIDDLE

                // This shifts everything up a little bit, because I don't like how
                // ALIGN_MIDDLE works.
                paddingTop = (-SCRAMBLE_PADDING_VERTICAL_TOP).toFloat()
                paddingBottom = SCRAMBLE_PADDING_VERTICAL_BOTTOM.toFloat()
                paddingLeft = SCRAMBLE_PADDING_HORIZONTAL.toFloat()
                paddingRight = SCRAMBLE_PADDING_HORIZONTAL.toFloat()

                // We space lines a little bit more here - it still fits in the cell height
                val extraLeadingMultiplier = 1.1f
                setLeading(0f, extraLeadingMultiplier)
            }

            table.addCell(scrambleCell)

            if (scrambleImageSize.width > 0 && scrambleImageSize.height > 0) {
                val svg = scramblingPuzzle.drawScramble(scramble, null)
                val tp = renderSvgToPDF(svg, scrambleImageSize, SCRAMBLE_IMAGE_PADDING)

                val imgCell = PdfPCell(Image.getInstance(tp), true).apply {
                    backgroundColor = BaseColor.LIGHT_GRAY
                    verticalAlignment = PdfPCell.ALIGN_MIDDLE
                    horizontalAlignment = PdfPCell.ALIGN_MIDDLE
                }

                table.addCell(imgCell)
            } else {
                table.addCell(EMPTY_CELL_CONTENT)
            }
        }

        return table
    }

    companion object {
        const val MAX_SCRAMBLES_PER_PAGE = 7
        const val SCRAMBLE_IMAGE_PADDING = 2

        const val SCRAMBLE_PADDING_VERTICAL_TOP = 3
        const val SCRAMBLE_PADDING_VERTICAL_BOTTOM = 6
        const val SCRAMBLE_PADDING_HORIZONTAL = 1

        const val WIDEST_CHAR_STRING = "M"

        const val EMPTY_CELL_CONTENT = ""

        const val STD_SCRAMBLE_PREFIX = EMPTY_CELL_CONTENT
        const val EXTRA_SCRAMBLE_PREFIX = "E"

        const val TABLE_HEADING_EXTRA_SCRAMBLES = "Extra Scrambles"

        private const val MIN_LINES_TO_ALTERNATE_HIGHLIGHTING = 4

        private val HIGHLIGHT_COLOR = BaseColor(230, 230, 230)

        const val INDEX_COLUMN_WIDTH_RATIO = 20f
    }
}
