package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.awt.DefaultFontMapper
import com.itextpdf.awt.PdfGraphics2D
import com.itextpdf.text.*
import com.itextpdf.text.pdf.PdfPCell
import com.itextpdf.text.pdf.PdfPTable
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
import java.util.HashMap
import kotlin.math.log10
import kotlin.math.min

class GeneralScrambleSheet(scrambleRequest: ScrambleRequest, globalTitle: String?) : BaseScrambleSheet(scrambleRequest, globalTitle) {
    override fun PdfWriter.writeContents() {
        val pageSize = document.pageSize

        val sideMargins = 100f + document.leftMargin() + document.rightMargin()
        val availableWidth = pageSize.width - sideMargins
        val vertMargins = document.topMargin() + document.bottomMargin()

        // Yeee magic numbers. This should make space for the headerTable.
        val extraScrambleSpacing = 20.takeIf { scrambleRequest.extraScrambles.isNotEmpty() } ?: 0

        val availableHeight = pageSize.height - vertMargins - extraScrambleSpacing

        val scramblesPerPage = min(MAX_SCRAMBLES_PER_PAGE, scrambleRequest.allScrambles.size)
        val maxScrambleImageHeight = (availableHeight / scramblesPerPage - 2 * SCRAMBLE_IMAGE_PADDING).toInt()

        // We don't let scramble images take up more than half the page
        val maxScrambleImageWidth = (availableWidth / 2).toInt().takeUnless {
            // TODO - If we allow the megaminx image to be too wide, the
            //   Megaminx scrambles get really tiny. This tweak allocates
            //   a more optimal amount of space to the scrambles. This is possible
            //   because the scrambles are so uniformly sized.
            scrambleRequest.scrambler.shortName == "minx"
        } ?: 190

        val scrambleImageSize = scrambleRequest.scrambler.getPreferredSize(maxScrambleImageWidth, maxScrambleImageHeight)

        // First do a dry run just to see if any scrambles require highlighting.
        // Then do the real run, and force highlighting on every scramble
        // if any scramble required it.
        var forceHighlighting = false
        for (dryRun in booleanArrayOf(true, false)) {
            val scrambleNumberPrefix = ""
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
                val headerTable = PdfPTable(1).apply {
                    setTotalWidth(floatArrayOf(availableWidth))
                    isLockedWidth = true
                }

                val extraScramblesHeader = PdfPCell(Paragraph("Extra scrambles")).apply {
                    verticalAlignment = PdfPCell.ALIGN_MIDDLE
                    paddingBottom = 3f
                }

                headerTable.addCell(extraScramblesHeader)
                if (!dryRun) {
                    document.add(headerTable)
                }

                val extraScrambleNumberPrefix = "E"
                val extraTableAndHighlighting = createTable(sideMargins, scrambleImageSize, scrambleRequest.extraScrambles, scrambleRequest.scrambler, scrambleRequest.colorScheme, extraScrambleNumberPrefix, forceHighlighting)
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

        val leadingMultiplier = 1f

        val charsWide = scrambleNumberPrefix.length + 1 + log10(scrambles.size.toDouble()).toInt()
        // M has got to be as wide or wider than the widest digit in our font
        val wideString = WIDEST_CHAR_STRING.repeat(charsWide) + "."

        // I don't know why we need the +5, perhaps there's some padding?
        val col1Width = Chunk(wideString).widthPoint + 5f

        val availableWidth = pageSize.width - sideMargins
        val scrambleColumnWidth = availableWidth - col1Width - scrambleImageSize.width.toFloat() - (2 * SCRAMBLE_IMAGE_PADDING).toFloat()
        val availableScrambleHeight = scrambleImageSize.height - 2 * SCRAMBLE_IMAGE_PADDING

        val table = PdfPTable(3).apply {
            setTotalWidth(floatArrayOf(col1Width, scrambleColumnWidth, (scrambleImageSize.width + 2 * SCRAMBLE_IMAGE_PADDING).toFloat()))
            isLockedWidth = true
        }

        val longestScramble = scrambles.maxBy { it.length } ?: ""

        val longestPaddedScrambleRaw = scrambles.map { StringUtil.padTurnsUniformly(it, WIDEST_CHAR_STRING) }
            .maxBy { it.length } ?: ""

        // I don't know how to configure ColumnText.fitText's word wrapping characters,
        // so instead, I just replace each character I don't want to wrap with M, which
        // should be the widest character (we're using a monospaced font,
        // so that doesn't really matter), and won't get wrapped.
        var longestPaddedScramble = longestPaddedScrambleRaw.replace("\\S".toRegex(), WIDEST_CHAR_STRING)

        val tryToFitOnOneLine = "\n" !in longestPaddedScramble
        if (tryToFitOnOneLine) {
            // If the scramble contains newlines, then we *only* allow wrapping at the
            // newlines.
            longestPaddedScramble = longestPaddedScramble.replace(" ".toRegex(), WIDEST_CHAR_STRING)
        }
        val availableArea = Rectangle(scrambleColumnWidth - 2 * SCRAMBLE_PADDING_HORIZONTAL,
            (availableScrambleHeight - SCRAMBLE_PADDING_VERTICAL_TOP - SCRAMBLE_PADDING_VERTICAL_BOTTOM).toFloat())

        val longestScrambleOneLine = longestScramble.replace(".".toRegex(), WIDEST_CHAR_STRING)
        val perfectFontSizeForOneLine = PdfUtil.fitText(Font(FontUtil.MONO_FONT), longestScrambleOneLine, availableArea, FontUtil.MAX_SCRAMBLE_FONT_SIZE, false, leadingMultiplier)

        val oneLine = tryToFitOnOneLine && perfectFontSizeForOneLine >= FontUtil.MINIMUM_ONE_LINE_FONT_SIZE

        val perfectFontSize = PdfUtil.fitText(Font(FontUtil.MONO_FONT), longestPaddedScramble, availableArea, FontUtil.MAX_SCRAMBLE_FONT_SIZE, true, leadingMultiplier)
            .takeUnless { oneLine } ?: perfectFontSizeForOneLine

        val scrambleFont = Font(FontUtil.MONO_FONT, perfectFontSize, Font.NORMAL)

        var highlight = forceHighlighting
        for ((i, scramble) in scrambles.withIndex()) {
            val paddedScramble = if (oneLine) scramble else StringUtil.padTurnsUniformly(scramble, PdfUtil.NON_BREAKING_SPACE.toString())
            val ch = Chunk(scrambleNumberPrefix + (i + 1) + ".")
            val nthscramble = PdfPCell(Paragraph(ch)).apply {
                verticalAlignment = PdfPCell.ALIGN_MIDDLE
            }
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
                val imgCell = PdfPCell(Image.getInstance(tp), true).apply {
                    backgroundColor = BaseColor.LIGHT_GRAY
                    verticalAlignment = PdfPCell.ALIGN_MIDDLE
                    horizontalAlignment = PdfPCell.ALIGN_MIDDLE
                }

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

        const val WIDEST_CHAR_STRING = "M"

        private const val MIN_LINES_TO_ALTERNATE_HIGHLIGHTING = 4

        private val HIGHLIGHT_COLOR = BaseColor(230, 230, 230)
    }
}
