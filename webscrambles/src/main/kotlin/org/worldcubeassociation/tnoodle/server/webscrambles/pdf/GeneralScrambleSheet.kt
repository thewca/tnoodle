package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.awt.DefaultFontMapper
import com.itextpdf.awt.PdfGraphics2D
import com.itextpdf.text.*
import com.itextpdf.text.pdf.PdfPCell
import com.itextpdf.text.pdf.PdfPTable
import com.itextpdf.text.pdf.PdfReader
import com.itextpdf.text.pdf.PdfWriter
import net.gnehzr.tnoodle.scrambles.Puzzle
import net.gnehzr.tnoodle.svglite.Color
import net.gnehzr.tnoodle.svglite.Dimension
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfDrawUtil.drawSvg
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfUtil.splitToLineChunks
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.FontUtil
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfUtil
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.StringUtil
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.TableAndHighlighting
import java.io.ByteArrayOutputStream
import java.util.HashMap

class GeneralScrambleSheet(scrambleRequest: ScrambleRequest, globalTitle: String?, password: String?) : BaseScrambleSheet(scrambleRequest, globalTitle, password) {
    override fun PdfWriter.writeContents() {
        val pageSize = document.pageSize

        val sideMargins = 100f + document.leftMargin() + document.rightMargin()
        val availableWidth = pageSize.width - sideMargins
        val vertMargins = document.topMargin() + document.bottomMargin()
        var availableHeight = pageSize.height - vertMargins

        if (scrambleRequest.extraScrambles.isNotEmpty()) {
            availableHeight -= 20f // Yeee magic numbers. This should make space for the headerTable.
        }

        val scramblesPerPage = Math.min(MAX_SCRAMBLES_PER_PAGE, scrambleRequest.allScrambles.size)
        val maxScrambleImageHeight = (availableHeight / scramblesPerPage - 2 * SCRAMBLE_IMAGE_PADDING).toInt()

        var maxScrambleImageWidth = (availableWidth / 2).toInt() // We don't let scramble images take up more than half the page

        if (scrambleRequest.scrambler.shortName == "minx") {
            // TODO - If we allow the megaminx image to be too wide, the
            //   Megaminx scrambles get really tiny. This tweak allocates
            //   a more optimal amount of space to the scrambles. This is possible
            //   because the scrambles are so uniformly sized.
            maxScrambleImageWidth = 190
        }

        val scrambleImageSize = scrambleRequest.scrambler.getPreferredSize(maxScrambleImageWidth, maxScrambleImageHeight)

        // First do a dry run just to see if any scrambles require highlighting.
        // Then do the real run, and force highlighting on every scramble
        // if any scramble required it.
        var forceHighlighting = false
        for (dryRun in booleanArrayOf(true, false)) {
            var scrambleNumberPrefix = ""
            val tableAndHighlighting = createTable(sideMargins, scrambleImageSize, scrambleRequest.scrambles, scrambleRequest.scrambler, scrambleRequest.colorScheme, scrambleNumberPrefix, forceHighlighting)
            if (dryRun) {
                if (tableAndHighlighting.highlighting) {
                    forceHighlighting = true
                    continue
                }
            } else {
                document.add(tableAndHighlighting.table)
            }

            if (scrambleRequest.extraScrambles.isNotEmpty()) {
                val headerTable = PdfPTable(1)
                headerTable.setTotalWidth(floatArrayOf(availableWidth))
                headerTable.isLockedWidth = true

                val extraScramblesHeader = PdfPCell(Paragraph("Extra scrambles"))
                extraScramblesHeader.verticalAlignment = PdfPCell.ALIGN_MIDDLE
                extraScramblesHeader.paddingBottom = 3f
                headerTable.addCell(extraScramblesHeader)
                if (!dryRun) {
                    document.add(headerTable)
                }

                scrambleNumberPrefix = "E"
                val extraTableAndHighlighting = createTable(sideMargins, scrambleImageSize, scrambleRequest.extraScrambles, scrambleRequest.scrambler, scrambleRequest.colorScheme, scrambleNumberPrefix, forceHighlighting)
                if (dryRun) {
                    if (tableAndHighlighting.highlighting) {
                        forceHighlighting = true
                        continue
                    }
                } else {
                    document.add(extraTableAndHighlighting.table)
                }
            }
        }
    }

    fun PdfWriter.createTable(sideMargins: Float, scrambleImageSize: Dimension, scrambles: List<String>, scrambler: Puzzle, colorScheme: HashMap<String, Color>?, scrambleNumberPrefix: String, forceHighlighting: Boolean): TableAndHighlighting {
        val cb = directContent

        val table = PdfPTable(3)

        var leadingMultiplier = 1f

        val charsWide = scrambleNumberPrefix.length + 1 + Math.log10(scrambles.size.toDouble()).toInt()
        var wideString = ""
        for (i in 0 until charsWide) {
            // M has got to be as wide or wider than the widest digit in our font
            wideString += "M"
        }
        wideString += "."
        var col1Width = Chunk(wideString).widthPoint
        // I don't know why we need this, perhaps there's some padding?
        col1Width += 5f

        val availableWidth = pageSize.width - sideMargins
        val scrambleColumnWidth = availableWidth - col1Width - scrambleImageSize.width.toFloat() - (2 * SCRAMBLE_IMAGE_PADDING).toFloat()
        val availableScrambleHeight = scrambleImageSize.height - 2 * SCRAMBLE_IMAGE_PADDING

        table.setTotalWidth(floatArrayOf(col1Width, scrambleColumnWidth, (scrambleImageSize.width + 2 * SCRAMBLE_IMAGE_PADDING).toFloat()))
        table.isLockedWidth = true

        var longestScramble = ""
        var longestPaddedScramble = ""
        for (scramble in scrambles) {
            if (scramble.length > longestScramble.length) {
                longestScramble = scramble
            }

            val paddedScramble = StringUtil.padTurnsUniformly(scramble, "M")
            if (paddedScramble.length > longestPaddedScramble.length) {
                longestPaddedScramble = paddedScramble
            }
        }
        // I don't know how to configure ColumnText.fitText's word wrapping characters,
        // so instead, I just replace each character I don't want to wrap with M, which
        // should be the widest character (we're using a monospaced font,
        // so that doesn't really matter), and won't get wrapped.
        val widestCharacter = 'M'
        longestPaddedScramble = longestPaddedScramble.replace("\\S".toRegex(), widestCharacter + "")
        var tryToFitOnOneLine = true
        if (longestPaddedScramble.indexOf("\n") >= 0) {
            // If the scramble contains newlines, then we *only* allow wrapping at the
            // newlines.
            longestPaddedScramble = longestPaddedScramble.replace(" ".toRegex(), "M")
            tryToFitOnOneLine = false
        }
        var oneLine = false
        val scrambleFont: Font?

        val availableArea = Rectangle(scrambleColumnWidth - 2 * SCRAMBLE_PADDING_HORIZONTAL,
            (availableScrambleHeight - SCRAMBLE_PADDING_VERTICAL_TOP - SCRAMBLE_PADDING_VERTICAL_BOTTOM).toFloat())
        var perfectFontSize = PdfUtil.fitText(Font(FontUtil.MONO_FONT), longestPaddedScramble, availableArea, FontUtil.MAX_SCRAMBLE_FONT_SIZE, true, leadingMultiplier)
        if (tryToFitOnOneLine) {
            val longestScrambleOneLine = longestScramble.replace(".".toRegex(), widestCharacter + "")
            val perfectFontSizeForOneLine = PdfUtil.fitText(Font(FontUtil.MONO_FONT), longestScrambleOneLine, availableArea, FontUtil.MAX_SCRAMBLE_FONT_SIZE, false, leadingMultiplier)
            oneLine = perfectFontSizeForOneLine >= FontUtil.MINIMUM_ONE_LINE_FONT_SIZE
            if (oneLine) {
                perfectFontSize = perfectFontSizeForOneLine
            }
        }
        scrambleFont = Font(FontUtil.MONO_FONT, perfectFontSize, Font.NORMAL)

        var highlight = forceHighlighting
        for (i in scrambles.indices) {
            val scramble = scrambles[i]
            val paddedScramble = if (oneLine) scramble else StringUtil.padTurnsUniformly(scramble, PdfUtil.NON_BREAKING_SPACE + "")
            val ch = Chunk(scrambleNumberPrefix + (i + 1) + ".")
            val nthscramble = PdfPCell(Paragraph(ch))
            nthscramble.verticalAlignment = PdfPCell.ALIGN_MIDDLE
            table.addCell(nthscramble)

            val scramblePhrase = Phrase()
            var nthLine = 1
            val lineChunks = paddedScramble.splitToLineChunks(scrambleFont, scrambleColumnWidth)
            if (lineChunks.size >= MIN_LINES_TO_ALTERNATE_HIGHLIGHTING) {
                highlight = true
            }

            for (lineChunk in lineChunks) {
                if (highlight && nthLine % 2 == 0) {
                    lineChunk.setBackground(HIGHLIGHT_COLOR)
                }
                scramblePhrase.add(lineChunk)
                nthLine++
            }

            val scrambleCell = PdfPCell(Paragraph(scramblePhrase))
            // We carefully inserted newlines ourselves to make stuff fit, don't
            // let itextpdf wrap lines for us.
            scrambleCell.isNoWrap = true
            scrambleCell.verticalAlignment = PdfPCell.ALIGN_MIDDLE
            // This shifts everything up a little bit, because I don't like how
            // ALIGN_MIDDLE works.
            scrambleCell.paddingTop = (-SCRAMBLE_PADDING_VERTICAL_TOP).toFloat()
            scrambleCell.paddingBottom = SCRAMBLE_PADDING_VERTICAL_BOTTOM.toFloat()
            scrambleCell.paddingLeft = SCRAMBLE_PADDING_HORIZONTAL.toFloat()
            scrambleCell.paddingRight = SCRAMBLE_PADDING_HORIZONTAL.toFloat()
            // We space lines a little bit more here - it still fits in the cell height
            leadingMultiplier = 1.1f
            scrambleCell.setLeading(0f, leadingMultiplier)
            table.addCell(scrambleCell)

            if (scrambleImageSize.width > 0 && scrambleImageSize.height > 0) {
                val tp = cb.createTemplate((scrambleImageSize.width + 2 * SCRAMBLE_IMAGE_PADDING).toFloat(), (scrambleImageSize.height + 2 * SCRAMBLE_IMAGE_PADDING).toFloat())
                val g2 = PdfGraphics2D(tp, tp.width, tp.height, DefaultFontMapper())
                g2.translate(SCRAMBLE_IMAGE_PADDING, SCRAMBLE_IMAGE_PADDING)

                try {
                    val svg = scrambler.drawScramble(scramble, colorScheme)
                    g2.drawSvg(svg, scrambleImageSize)
                } catch (e: Exception) {
                    table.addCell("Error drawing scramble: " + e.message)
                    // FIXME l.log(Level.WARNING, "Error drawing scramble, if you're having font issues, try installing ttf-dejavu.", e)
                    continue
                } finally {
                    g2.dispose() // iTextPdf blows up if we do not dispose of this
                }
                val imgCell = PdfPCell(Image.getInstance(tp), true)
                imgCell.backgroundColor = BaseColor.LIGHT_GRAY
                imgCell.verticalAlignment = PdfPCell.ALIGN_MIDDLE
                imgCell.horizontalAlignment = PdfPCell.ALIGN_MIDDLE
                table.addCell(imgCell)
            } else {
                table.addCell("")
            }
        }

        return TableAndHighlighting(table, highlight)
    }

    companion object {
        const val MAX_SCRAMBLES_PER_PAGE = 7
        const val SCRAMBLE_IMAGE_PADDING = 2

        const val SCRAMBLE_PADDING_VERTICAL_TOP = 3
        const val SCRAMBLE_PADDING_VERTICAL_BOTTOM = 6
        const val SCRAMBLE_PADDING_HORIZONTAL = 1

        private const val MIN_LINES_TO_ALTERNATE_HIGHLIGHTING = 4

        private val HIGHLIGHT_COLOR = BaseColor(230, 230, 230)
    }
}
