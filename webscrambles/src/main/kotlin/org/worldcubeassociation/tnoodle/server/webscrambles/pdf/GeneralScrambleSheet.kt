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
import java.io.File
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

        val allScrambleStrings = scrambleSet.allScrambles.toPDFStrings(scramblingPuzzle.shortName)

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

    private fun getFontConfiguration(availableArea: Rectangle, scrambles: List<String>): Font {
        val longestScramble = scrambles.maxByOrNull { it.length }.orEmpty()

        val longestPaddedScramble = scrambles.map { StringUtil.padTurnsUniformly(it, WIDEST_CHAR_STRING) }
            .maxByOrNull { it.length } ?: longestScramble

        val longestScrambleOneLine = NEW_LINE !in longestPaddedScramble

        // I don't know how to configure ColumnText.fitText's word wrapping characters,
        // so instead, I just replace each character I don't want to wrap with M, which
        // should be the widest character (we're using a monospaced font,
        // so that doesn't really matter), and won't get wrapped.
        val longestScrambleMasked = WIDEST_CHAR_STRING.repeat(longestScramble.length)
        val longestPaddedScrambleMasked = longestPaddedScramble.replace(" ".toRegex(), WIDEST_CHAR_STRING)

        val fontSizeWithoutPadding = PdfUtil.fitText(Font(FontUtil.MONO_FONT), longestScrambleMasked, availableArea, FontUtil.MAX_SCRAMBLE_FONT_SIZE, false)

        // If the scramble contains newlines, then we *only* allow wrapping at the newlines.
        val longestRespectingNewlines = longestPaddedScramble.takeIf { longestScrambleOneLine } ?: longestPaddedScrambleMasked
        val fontSizeIfIncludingNewlines = PdfUtil.fitText(Font(FontUtil.MONO_FONT), longestRespectingNewlines, availableArea, FontUtil.MAX_SCRAMBLE_FONT_SIZE, true)

        val oneLine = longestScrambleOneLine && fontSizeWithoutPadding >= FontUtil.MINIMUM_ONE_LINE_FONT_SIZE
        val perfectFontSize = fontSizeWithoutPadding.takeIf { oneLine } ?: fontSizeIfIncludingNewlines

        return Font(FontUtil.MONO_FONT, perfectFontSize, Font.NORMAL)
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

        val strScrambles = scrambles.toPDFStrings(scramblingPuzzle.shortName)

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
        const val MAX_SCRAMBLE_IMAGE_RATIO = 3
        const val SCRAMBLE_IMAGE_PADDING = 2

        const val SCRAMBLE_MARGIN = 5
        const val WIDEST_CHAR_STRING = Typography.nbsp.toString()

        const val EMPTY_CELL_CONTENT = ""

        const val STD_SCRAMBLE_PREFIX = EMPTY_CELL_CONTENT
        const val EXTRA_SCRAMBLE_PREFIX = "E"

        const val TABLE_HEADING_EXTRA_SCRAMBLES = "Extra Scrambles"

        private const val MIN_LINES_TO_ALTERNATE_HIGHLIGHTING = 4

        private val HIGHLIGHT_COLOR = BaseColor(230, 230, 230)

        const val INDEX_COLUMN_WIDTH_RATIO = 25
        const val EXTRA_SCRAMBLES_HEIGHT_RATIO = 30

        const val VERTICAL_MARGIN = 15f
        const val HORIZONTAL_MARGIN = 35f

        const val NEW_LINE = "\n"

        @JvmStatic
        fun main(args: Array<String>) {
            val rawScrambles = listOf(
                "F' D2 B2 Dw' Fw' U2 Dw Fw Lw' D2 Dw Bw' B' L Lw D' Lw B' F Fw' Rw' Uw D Bw2 Uw D U Rw' L2 B L2 R2 F' D F B2 Dw2 B' Dw Uw' B' Rw2 Lw' Uw' Fw Bw' R2 B' Uw Dw R' Uw' Lw2 R2 B2 Rw B' Bw' Rw2 R2 3Fw 3Uw2",
                "Fw2 Uw2 Fw' R U2 R Bw U' Fw2 U' Rw Fw2 Uw' Bw2 B2 F2 Rw2 F' Fw D2 Fw' Uw2 R' Rw F Fw' R L2 Rw2 Uw R2 Dw' F' U2 Uw2 F2 L' U Dw' Rw2 Bw2 Dw R' F' R F' L' U2 Dw R L Rw' D F2 L2 D F B L2 F' 3Uw",
                "Lw D2 F' U R' Dw2 L Fw F R2 Uw' Dw L' R' Rw U2 Fw' Dw2 Fw' U Bw2 Uw Bw2 B' Fw' Rw Dw2 F2 Uw Dw B R2 F B' L2 U' R' L Lw2 Uw2 Fw' U Rw Lw2 R' Bw2 Lw B' Rw Uw F D' Uw Dw Bw Lw R Uw U2 3Rw' 3Uw",
                "D' F2 Uw2 Fw Rw' Bw L2 Uw L2 Fw2 Dw2 D Uw2 B R' F' Rw2 D' U' Bw2 Dw B' U Rw2 R2 Fw D Dw2 Bw2 Fw' Lw' Fw Dw' F' U Bw Uw2 Bw R Rw U' Bw2 Lw' Rw' Uw Lw' Uw2 Bw Fw' Dw Bw F Lw' Dw U2 Fw2 Dw Fw2 U2 Rw2 3Fw",
                "Rw2 L Uw Rw' Fw' Rw' F Fw2 U2 D R U B' U2 B2 F' Lw' F Lw2 L2 Rw2 Fw' D2 Dw' U' Lw' B D' Fw' U Uw' Fw L' F2 R2 D2 B U D2 L B2 D' F2 Dw D Rw D' Lw F' U' Uw2 Fw' Bw' R Lw' F Lw2 Rw Fw2 F 3Rw2 3Uw"
            )

            val scrambles = rawScrambles.map { Scramble(it) }
            val scrambleSet = ScrambleSet(42, scrambles, emptyList())

            val activityCode = ActivityCode.compile(EventData.FIVE_BLD, 0, 0, 0)

            val pdfSheet = GeneralScrambleSheet(scrambleSet, activityCode)
            val pdfBytes = pdfSheet.render()

            File(File(System.getProperty("user.home")), "TNoodleDummy.pdf").writeBytes(pdfBytes)
        }
    }
}
