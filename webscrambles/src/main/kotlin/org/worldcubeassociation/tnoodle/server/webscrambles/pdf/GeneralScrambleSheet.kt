package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.*
import com.itextpdf.text.pdf.PdfContentByte
import com.itextpdf.text.pdf.PdfPCell
import com.itextpdf.text.pdf.PdfPTable
import com.itextpdf.text.pdf.PdfWriter
import org.worldcubeassociation.tnoodle.svglite.Dimension
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.FontUtil
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfDrawUtil.renderSvgToPDF
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfUtil
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfUtil.splitToLineChunks
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.StringUtil
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import kotlin.math.min

class GeneralScrambleSheet(scrambleSet: ScrambleSet, activityCode: ActivityCode) : BaseScrambleSheet(scrambleSet, activityCode) {
    override fun PdfWriter.writeContents(document: Document) {
        val pageSize = document.pageSize

        val availableWidth = pageSize.width - 2 * HORIZONTAL_MARGIN
        val availableHeight = pageSize.height - 2 * VERTICAL_MARGIN

        val headerAndFooterHeight = availableHeight / HEADER_AND_FOOTER_HEIGHT_RATIO
        val extraScrambleLabelHeight = if (scrambleSet.extraScrambles.isNotEmpty()) availableHeight / EXTRA_SCRAMBLES_HEIGHT_RATIO else 0f

        val indexColumnWidth = availableWidth / INDEX_COLUMN_WIDTH_RATIO

        // Available height for all scrambles (including extras)
        val allScramblesHeight = availableHeight - 2 * headerAndFooterHeight - extraScrambleLabelHeight

        val scramblesPerPage = min(MAX_SCRAMBLES_PER_PAGE, scrambleSet.allScrambles.size)
        val maxScrambleImageHeight = (allScramblesHeight / scramblesPerPage - 2 * SCRAMBLE_IMAGE_PADDING).toInt()

        // We don't let scramble images take up too much of a the page
        val maxScrambleImageWidth = (availableWidth / 3).toInt()

        val scrambleImageSize = scramblingPuzzle.getPreferredSize(maxScrambleImageWidth, maxScrambleImageHeight)

        val scrambleImageHeight = scrambleImageSize.height.toFloat()
        val scrambleColumnWidth = availableWidth - indexColumnWidth - scrambleImageSize.width

        val allScrambleStrings = scrambleSet.allScrambles.toPDFStrings(scramblingPuzzle.shortName)

        val scrambleFont = getFontConfiguration(scrambleColumnWidth, scrambleImageHeight, allScrambleStrings)

        // First check if any scramble requires highlighting.
        val useHighlighting = requiresHighlighting(scrambleColumnWidth, scrambleFont, allScrambleStrings)

        // Add main scrambles
        val table = directContent.createTable(scrambleColumnWidth, indexColumnWidth, scrambleFont, scrambleImageSize, scrambleSet.scrambles, STD_SCRAMBLE_PREFIX, useHighlighting)
        document.add(table)

        // Maybe add extra scrambles
        if (scrambleSet.extraScrambles.isNotEmpty()) {
            val headerTable = PdfPTable(1).apply {
                setTotalWidth(floatArrayOf(availableWidth))
                isLockedWidth = true
            }

            val extraScramblesHeader = PdfPCell(Paragraph(TABLE_HEADING_EXTRA_SCRAMBLES)).apply {
                verticalAlignment = PdfPCell.ALIGN_MIDDLE
                horizontalAlignment = PdfPCell.ALIGN_CENTER
                fixedHeight = extraScrambleLabelHeight
                border = PdfPCell.NO_BORDER
            }

            headerTable.addCell(extraScramblesHeader)
            document.add(headerTable)

            val extraTable = directContent.createTable(scrambleColumnWidth, indexColumnWidth, scrambleFont, scrambleImageSize, scrambleSet.extraScrambles, EXTRA_SCRAMBLE_PREFIX, useHighlighting)
            document.add(extraTable)
        }
    }

    private fun getFontConfiguration(scrambleColumnWidth: Float, scrambleImageSize: Float, scrambles: List<String>): Font {
        val availableScrambleHeight = scrambleImageSize - 2 * SCRAMBLE_IMAGE_PADDING

        val availableArea = Rectangle(scrambleColumnWidth - 2 * SCRAMBLE_PADDING_HORIZONTAL,
            (availableScrambleHeight - SCRAMBLE_PADDING_VERTICAL_TOP - SCRAMBLE_PADDING_VERTICAL_BOTTOM))

        val longestScramble = scrambles.flatMap{it.split(NEW_LINE)}.maxBy { it.length } ?: ""
        val maxLines = scrambles.map{it.split(NEW_LINE)}.map{it.count()}.max() ?: 1

        // I don't know how to configure ColumnText.fitText's word wrapping characters,
        // so instead, I just replace each character I don't want to wrap with M, which
        // should be the widest character (we're using a monospaced font,
        // so that doesn't really matter), and won't get wrapped.
        val longestScrambleMasked = longestScramble.replace(".".toRegex(), WIDEST_CHAR_STRING)

        val fontSizeForMaskedUnaligned = PdfUtil.fitText(Font(FontUtil.MONO_FONT), longestScrambleMasked, availableArea, FontUtil.MAX_SCRAMBLE_FONT_SIZE, true, 1f) // FIXME const

        // If the scramble contains newlines, then we *only* allow wrapping at the newlines.
        val fontSizeIfIncludingNewlines = availableScrambleHeight / maxLines

        val perfectFontSize = fontSizeForMaskedUnaligned.takeIf { maxLines == 1 } ?: fontSizeIfIncludingNewlines

        return Font(FontUtil.MONO_FONT, perfectFontSize, Font.NORMAL)
    }

    private fun requiresHighlighting(scrambleColumnWidth: Float, scrambleFont: Font, scrambles: List<String>): Boolean {
        val paddedScrambles = scrambles.map { StringUtil.padTurnsUniformly(it, PdfUtil.NON_BREAKING_SPACE.toString()) }
        val lineChunks = paddedScrambles.map { it.splitToLineChunks(scrambleFont, scrambleColumnWidth) }

        return lineChunks.any { it.size >= MIN_LINES_TO_ALTERNATE_HIGHLIGHTING }
    }

    private fun PdfContentByte.createTable(scrambleColumnWidth: Float, indexColumnWidth: Float, scrambleFont: Font, scrambleImageSize: Dimension, scrambles: List<Scramble>, scrambleNumberPrefix: String, useHighlighting: Boolean): PdfPTable {

        val table = PdfPTable(3).apply {
            setTotalWidth(floatArrayOf(indexColumnWidth, scrambleColumnWidth, (scrambleImageSize.width + 2 * SCRAMBLE_IMAGE_PADDING).toFloat()))
            isLockedWidth = true
        }

        val strScrambles = scrambles.toPDFStrings(scramblingPuzzle.shortName)

        for ((i, scramble) in strScrambles.withIndex()) {
            val indexCell = PdfPCell(Paragraph("$scrambleNumberPrefix${i + 1}")).apply {
                verticalAlignment = PdfPCell.ALIGN_MIDDLE
                horizontalAlignment = PdfPCell.ALIGN_CENTER
            }
            table.addCell(indexCell)

            val paddedScramble = StringUtil.padTurnsUniformly(scramble, PdfUtil.NON_BREAKING_SPACE.toString())
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
        private fun List<Scramble>.toPDFStrings(puzzleName: String) =
            flatMap { it.allScrambleStrings }
                .takeUnless { puzzleName == "minx" } // minx scrambles intentionally include "\n" chars for alignment
                ?: map { it.scrambleString }

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

        const val HEADER_AND_FOOTER_HEIGHT_RATIO = 12
        const val INDEX_COLUMN_WIDTH_RATIO = 25
        const val EXTRA_SCRAMBLES_HEIGHT_RATIO = 30

        const val VERTICAL_MARGIN = 15f
        const val HORIZONTAL_MARGIN = 35f

        const val NEW_LINE = "\n"
    }
}
