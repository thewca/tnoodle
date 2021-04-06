package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.*
import com.itextpdf.text.pdf.PdfContentByte
import com.itextpdf.text.pdf.PdfPCell
import com.itextpdf.text.pdf.PdfPTable
import com.itextpdf.text.pdf.PdfWriter
import org.worldcubeassociation.tnoodle.server.model.EventData
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

        val headerAndFooterHeight = availableHeight / WatermarkPdfWrapper.HEADER_AND_FOOTER_HEIGHT_RATIO
        val extraScrambleLabelHeight = if (scrambleSet.extraScrambles.isNotEmpty()) availableHeight / EXTRA_SCRAMBLES_HEIGHT_RATIO else 0f

        val indexColumnWidth = availableWidth / INDEX_COLUMN_WIDTH_RATIO

        // Available height for all scrambles (including extras)
        val allScramblesHeight = availableHeight - 2 * headerAndFooterHeight - extraScrambleLabelHeight

        val scramblesPerPage = min(MAX_SCRAMBLES_PER_PAGE, scrambleSet.allScrambles.size)
        val maxScrambleImageHeight = (allScramblesHeight / scramblesPerPage - 2 * SCRAMBLE_IMAGE_PADDING).toInt()

        // We don't let scramble images take up too much of a the page
        val maxScrambleImageWidth = (availableWidth / MAX_SCRAMBLE_IMAGE_RATIO).toInt()

        val scrambleImageSize = scramblingPuzzle.getPreferredSize(maxScrambleImageWidth, maxScrambleImageHeight)

        val allScrambleStrings = scrambleSet.allScrambles.toPDFStrings(activityCode.eventModel)

        val scrambleImageHeight = scrambleImageSize.height.toFloat()
        val scrambleColumnWidth = availableWidth - indexColumnWidth - scrambleImageSize.width

        val availableScrambleArea = Rectangle(scrambleColumnWidth, scrambleImageHeight - 2 * SCRAMBLE_MARGIN)

        val scrambleFont = getFontConfiguration(availableScrambleArea, allScrambleStrings)

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

            val extraParagraph = Paragraph(TABLE_HEADING_EXTRA_SCRAMBLES).apply {
                font.style = Font.BOLD
            }

            val extraScramblesHeader = PdfPCell(extraParagraph).apply {
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

    private fun getFontConfiguration(availableArea: Rectangle, scrambles: List<String>): Font {
        val paddedScrambles = scrambles.map { StringUtil.padTurnsUniformly(it, Typography.nbsp.toString()) }

        val longestScrambleLine = paddedScrambles.flatMap { it.split(NEW_LINE) }.maxByOrNull { it.length }.orEmpty()
        val maxLinesCount = paddedScrambles.map { it.split(NEW_LINE) }.maxOfOrNull { it.count() } ?: 1

        val scramblesHaveLineBreaks = scrambles.any { NEW_LINE in it }

        val fontSize = fitFontSize(availableArea, longestScrambleLine, scramblesHaveLineBreaks)
        val maxFontSizePerLine = availableArea.height / maxLinesCount

        // fontSize should fit horizontally. fontSizeIfIncludingNewlines should fit considering \n
        // In case maxLines = 1, fontSizeIfIncludingNewlines is just ignored (as 1 font size should fill the whole rectangle's height)
        // in case we have maxLines > 1, we fit width or height and take the min of it.
        val perfectFontSize = min(fontSize, maxFontSizePerLine)

        return Font(FontUtil.MONO_FONT, perfectFontSize, Font.NORMAL)
    }

    private fun fitFontSize(availableArea: Rectangle, longestScrambleLine: String, scramblesHaveLineBreaks: Boolean = false): Float {
        val fittingFont = Font(FontUtil.MONO_FONT)

        return if (scramblesHaveLineBreaks) {
            // if our scrambles dictate line breaks, then just calculate the fitting text size right away
            PdfUtil.fitText(fittingFont, longestScrambleLine, availableArea, FontUtil.MAX_SCRAMBLE_FONT_SIZE, true)
        } else {
            // try to fit them on one line
            val oneLineFontSize = PdfUtil.fitText(fittingFont, longestScrambleLine, availableArea, FontUtil.MAX_SCRAMBLE_FONT_SIZE, false)

            // is the optimal font size too small to read?
            if (oneLineFontSize < FontUtil.MINIMUM_ONE_LINE_FONT_SIZE) {
                PdfUtil.fitText(fittingFont, longestScrambleLine, availableArea, FontUtil.MAX_SCRAMBLE_FONT_SIZE, true)
            } else oneLineFontSize
        }
    }

    private fun requiresHighlighting(scrambleColumnWidth: Float, scrambleFont: Font, scrambles: List<String>): Boolean {
        val lineChunks = scrambles.map { it.splitToLineChunks(scrambleFont, scrambleColumnWidth) }

        return lineChunks.any { it.size >= MIN_LINES_TO_ALTERNATE_HIGHLIGHTING }
    }

    private fun PdfContentByte.createTable(scrambleColumnWidth: Float, indexColumnWidth: Float, scrambleFont: Font, scrambleImageSize: Dimension, scrambles: List<Scramble>, scrambleNumberPrefix: String, useHighlighting: Boolean): PdfPTable {

        val table = PdfPTable(3).apply {
            setTotalWidth(floatArrayOf(indexColumnWidth, scrambleColumnWidth, (scrambleImageSize.width + 2 * SCRAMBLE_IMAGE_PADDING).toFloat()))
            isLockedWidth = true
        }

        val strScrambles = scrambles.toPDFStrings(activityCode.eventModel)

        for ((i, scramble) in strScrambles.withIndex()) {
            val indexCell = PdfPCell(Paragraph("$scrambleNumberPrefix${i + 1}")).apply {
                verticalAlignment = PdfPCell.ALIGN_MIDDLE
                horizontalAlignment = PdfPCell.ALIGN_CENTER
            }
            table.addCell(indexCell)

            val lineChunks = scramble.splitToLineChunks(scrambleFont, scrambleColumnWidth)
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
                // iText5 defines strange default margins, so we push the text up artificially
                paddingTop = SCRAMBLE_CELL_TOP_MARGIN.toFloat()
                setLeading(0f, SCRAMBLE_CELL_MULTIPLIED_LEADING.toFloat())
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
        private fun List<Scramble>.toPDFStrings(event: EventData?) =
            flatMap { it.allScrambleStrings }
                .takeUnless { event == EventData.MEGA } // Megaminx scrambles intentionally include "\n" chars for alignment
                ?: map { it.scrambleString }

        const val MAX_SCRAMBLES_PER_PAGE = 7
        const val MAX_SCRAMBLE_IMAGE_RATIO = 3
        const val SCRAMBLE_IMAGE_PADDING = 2

        const val SCRAMBLE_MARGIN = 5
        const val SCRAMBLE_CELL_TOP_MARGIN = -2
        const val SCRAMBLE_CELL_MULTIPLIED_LEADING = 1.07

        const val EMPTY_CELL_CONTENT = ""

        const val STD_SCRAMBLE_PREFIX = EMPTY_CELL_CONTENT
        const val EXTRA_SCRAMBLE_PREFIX = "E"

        const val TABLE_HEADING_EXTRA_SCRAMBLES = "Extra Scrambles"

        private const val MIN_LINES_TO_ALTERNATE_HIGHLIGHTING = 4

        private val HIGHLIGHT_COLOR = BaseColor(230, 230, 230)

        const val INDEX_COLUMN_WIDTH_RATIO = 25
        const val EXTRA_SCRAMBLES_HEIGHT_RATIO = 35

        const val VERTICAL_MARGIN = 15
        const val HORIZONTAL_MARGIN = 35

        const val NEW_LINE = "\n"
    }
}
