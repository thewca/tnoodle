package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.awt.DefaultFontMapper
import com.itextpdf.awt.PdfGraphics2D
import com.itextpdf.text.*
import com.itextpdf.text.pdf.PdfContentByte
import com.itextpdf.text.pdf.PdfPCell
import com.itextpdf.text.pdf.PdfPTable
import com.itextpdf.text.pdf.PdfWriter
import net.gnehzr.tnoodle.scrambles.Puzzle
import net.gnehzr.tnoodle.svglite.Color
import net.gnehzr.tnoodle.svglite.Dimension
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.FontUtil.MAX_SCRAMBLE_FONT_SIZE
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.FontUtil.MINIMUM_ONE_LINE_FONT_SIZE
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.FontUtil.MONO_FONT
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.FontUtil.getFontForLocale
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.PdfDrawUtil.drawDashedLine
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.PdfDrawUtil.drawSvg
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.PdfDrawUtil.fitAndShowText
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.PdfDrawUtil.populateRect
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.PdfUtil.NON_BREAKING_SPACE
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.PdfUtil.fitText
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.PdfUtil.splitTextToLineChunks
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.StringUtil.padTurnsUniformly
import java.util.*

object PdfSheetUtil {
    const val SCRAMBLE_PADDING_VERTICAL_TOP = 3
    const val SCRAMBLE_PADDING_VERTICAL_BOTTOM = 6
    const val SCRAMBLE_PADDING_HORIZONTAL = 1

    const val MAX_SCRAMBLES_PER_PAGE = 7
    const val SCRAMBLE_IMAGE_PADDING = 2

    const val WCA_MAX_MOVES_FMC = 80

    private const val MIN_LINES_TO_ALTERNATE_HIGHLIGHTING = 4
    private val HIGHLIGHT_COLOR = BaseColor(230, 230, 230)

    fun addScrambles(docWriter: PdfWriter, doc: Document, scrambleRequest: ScrambleRequest, globalTitle: String?, locale: Locale) {
        if (scrambleRequest.fmc) {
            for (i in scrambleRequest.scrambles.indices) {
                addFmcSolutionSheet(docWriter, doc, scrambleRequest, globalTitle, i, locale)
            }
        } else {
            val pageSize = doc.pageSize

            val sideMargins = 100f + doc.leftMargin() + doc.rightMargin()
            val availableWidth = pageSize.width - sideMargins
            val vertMargins = doc.topMargin() + doc.bottomMargin()
            var availableHeight = pageSize.height - vertMargins
            if (scrambleRequest.extraScrambles.isNotEmpty()) {
                availableHeight -= 20f // Yeee magic numbers. This should make space for the headerTable.
            }
            val scramblesPerPage = Math.min(MAX_SCRAMBLES_PER_PAGE, scrambleRequest.allScrambles.size)
            val maxScrambleImageHeight = (availableHeight / scramblesPerPage - 2 * SCRAMBLE_IMAGE_PADDING).toInt()

            var maxScrambleImageWidth = (availableWidth / 2).toInt() // We don't let scramble images take up more than half the page
            if (scrambleRequest.scrambler.shortName == "minx") {
                // TODO - If we allow the megaminx image to be too wide, the
                // megaminx scrambles get really tiny. This tweak allocates
                // a more optimal amount of space to the scrambles. This is possible
                // because the scrambles are so uniformly sized.
                maxScrambleImageWidth = 190
            }

            val scrambleImageSize = scrambleRequest.scrambler.getPreferredSize(maxScrambleImageWidth, maxScrambleImageHeight)

            // First do a dry run just to see if any scrambles require highlighting.
            // Then do the real run, and force highlighting on every scramble
            // if any scramble required it.
            var forceHighlighting = false
            for (dryRun in booleanArrayOf(true, false)) {
                var scrambleNumberPrefix = ""
                val tableAndHighlighting = createTable(docWriter, doc, sideMargins, scrambleImageSize, scrambleRequest.scrambles, scrambleRequest.scrambler, scrambleRequest.colorScheme, scrambleNumberPrefix, forceHighlighting)
                if (dryRun) {
                    if (tableAndHighlighting.highlighting) {
                        forceHighlighting = true
                        continue
                    }
                } else {
                    doc.add(tableAndHighlighting.table)
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
                        doc.add(headerTable)
                    }

                    scrambleNumberPrefix = "E"
                    val extraTableAndHighlighting = createTable(docWriter, doc, sideMargins, scrambleImageSize, scrambleRequest.extraScrambles, scrambleRequest.scrambler, scrambleRequest.colorScheme, scrambleNumberPrefix, forceHighlighting)
                    if (dryRun) {
                        if (tableAndHighlighting.highlighting) {
                            forceHighlighting = true
                            continue
                        }
                    } else {
                        doc.add(extraTableAndHighlighting.table)
                    }
                }
            }
        }
        doc.newPage()
    }

    fun addFmcSolutionSheet(docWriter: PdfWriter, doc: Document, scrambleRequest: ScrambleRequest, globalTitle: String?, index: Int, locale: Locale) {
        var index = index
        val withScramble = index != -1
        val pageSize = doc.pageSize
        var scramble: String? = null
        if (withScramble) {
            scramble = scrambleRequest.scrambles[index]
        }
        val cb = docWriter.directContent
        val LINE_THICKNESS = 0.5f
        val bf = getFontForLocale(locale)

        val bottom = 30
        val left = 35
        val right = (pageSize.width - left).toInt()
        val top = (pageSize.height - bottom).toInt()

        val height = top - bottom
        val width = right - left

        val solutionBorderTop = bottom + (height * .5).toInt()
        val scrambleBorderTop = solutionBorderTop + 40

        val competitorInfoBottom = top - (height * if (withScramble) .15 else .27).toInt()
        val gradeBottom = competitorInfoBottom - 50
        val competitorInfoLeft = right - (width * .45).toInt()

        val padding = 5

        // Outer border
        cb.setLineWidth(2f)
        cb.moveTo(left.toFloat(), top.toFloat())
        cb.lineTo(left.toFloat(), bottom.toFloat())
        cb.lineTo(right.toFloat(), bottom.toFloat())
        cb.lineTo(right.toFloat(), top.toFloat())

        // Solution border
        if (withScramble) {
            cb.moveTo(left.toFloat(), solutionBorderTop.toFloat())
            cb.lineTo(right.toFloat(), solutionBorderTop.toFloat())
        }

        // Rules bottom border
        cb.moveTo(left.toFloat(), scrambleBorderTop.toFloat())
        cb.lineTo((if (withScramble) competitorInfoLeft else right).toFloat(), scrambleBorderTop.toFloat())

        // Rules right border
        if (!withScramble) {
            cb.moveTo(competitorInfoLeft.toFloat(), scrambleBorderTop.toFloat())
        }
        cb.lineTo(competitorInfoLeft.toFloat(), gradeBottom.toFloat())

        // Grade bottom border
        cb.moveTo(competitorInfoLeft.toFloat(), gradeBottom.toFloat())
        cb.lineTo(right.toFloat(), gradeBottom.toFloat())

        // Competitor info bottom border
        cb.moveTo(competitorInfoLeft.toFloat(), competitorInfoBottom.toFloat())
        cb.lineTo(right.toFloat(), competitorInfoBottom.toFloat())

        // Competitor info left border
        cb.moveTo(competitorInfoLeft.toFloat(), gradeBottom.toFloat())
        cb.lineTo(competitorInfoLeft.toFloat(), top.toFloat())

        // Solution lines
        val availableSolutionWidth = right - left
        val availableSolutionHeight = scrambleBorderTop - bottom
        val lineWidth = 25
        val linesX = 10
        val linesY = Math.ceil(1.0 * WCA_MAX_MOVES_FMC / linesX).toInt()

        cb.setLineWidth(LINE_THICKNESS)
        cb.stroke()

        val excessX = availableSolutionWidth - linesX * lineWidth
        var moveCount = 0
        solutionLines@ for (y in 0 until linesY) {
            for (x in 0 until linesX) {
                if (moveCount >= WCA_MAX_MOVES_FMC) {
                    break@solutionLines
                }
                val xPos = left + x * lineWidth + (x + 1) * excessX / (linesX + 1)
                val yPos = (if (withScramble) solutionBorderTop else scrambleBorderTop) - (y + 1) * availableSolutionHeight / (linesY + 1)
                cb.moveTo(xPos.toFloat(), yPos.toFloat())
                cb.lineTo((xPos + lineWidth).toFloat(), yPos.toFloat())
                moveCount++
            }
        }

        val UNDERLINE_THICKNESS = 0.2f
        cb.setLineWidth(UNDERLINE_THICKNESS)
        cb.stroke()

        if (withScramble) {
            cb.beginText()
            val availableScrambleSpace = right - left - 2 * padding
            var scrambleFontSize = 20
            val scrambleStr = Translate.translate("fmc.scramble", locale) + ": " + scramble
            var scrambleWidth: Float
            do {
                scrambleFontSize--
                scrambleWidth = bf.getWidthPoint(scrambleStr, scrambleFontSize.toFloat())
            } while (scrambleWidth > availableScrambleSpace)

            cb.setFontAndSize(bf, scrambleFontSize.toFloat())
            val scrambleY = 3 + solutionBorderTop + (scrambleBorderTop - solutionBorderTop - scrambleFontSize) / 2
            cb.showTextAligned(PdfContentByte.ALIGN_LEFT, scrambleStr, (left + padding).toFloat(), scrambleY.toFloat(), 0f)
            cb.endText()

            val availableScrambleWidth = right - competitorInfoLeft
            val availableScrambleHeight = gradeBottom - scrambleBorderTop
            val dim = scrambleRequest.scrambler.getPreferredSize(availableScrambleWidth - 2, availableScrambleHeight - 2)
            val tp = cb.createTemplate(dim.width.toFloat(), dim.height.toFloat())
            val g2 = PdfGraphics2D(tp, dim.width.toFloat(), dim.height.toFloat(), DefaultFontMapper())

            try {
                val svg = scrambleRequest.scrambler.drawScramble(scramble, scrambleRequest.colorScheme)
                g2.drawSvg(svg, dim)
            } finally {
                g2.dispose()
            }

            cb.addImage(Image.getInstance(tp), dim.width.toFloat(), 0f, 0f, dim.height.toFloat(), (competitorInfoLeft + (availableScrambleWidth - dim.width) / 2).toFloat(), (scrambleBorderTop + (availableScrambleHeight - dim.height) / 2).toFloat())
        }

        var fontSize = 15
        val margin = 5
        val showScrambleCount = withScramble && (scrambleRequest.scrambles.size > 1 || scrambleRequest.totalAttempt > 1)

        val competitorInfoRect = Rectangle((competitorInfoLeft + margin).toFloat(), top.toFloat(), (right - margin).toFloat(), competitorInfoBottom.toFloat())
        val gradeRect = Rectangle((competitorInfoLeft + margin).toFloat(), competitorInfoBottom.toFloat(), (right - margin).toFloat(), gradeBottom.toFloat())
        val scrambleImageRect = Rectangle((competitorInfoLeft + margin).toFloat(), gradeBottom.toFloat(), (right - margin).toFloat(), scrambleBorderTop.toFloat())

        val shortFill = ": ____"
        val longFill = ": __________________"

        // competitor and competition info
        var list = ArrayList<String>()
        var alignList = ArrayList<Int>()

        if (withScramble) {
            list.add(globalTitle!!)
            alignList.add(Element.ALIGN_CENTER)
            list.add(scrambleRequest.title)
            alignList.add(Element.ALIGN_CENTER)

            if (showScrambleCount) {

                if (scrambleRequest.totalAttempt > 1) { // this is for ordered scrambles
                    index = Math.max(scrambleRequest.attempt - 1, index)
                } else {
                    scrambleRequest.totalAttempt = scrambleRequest.scrambles.size
                }

                val substitutions = HashMap<String, String>()
                substitutions["scrambleIndex"] = "" + (index + 1)
                substitutions["scrambleCount"] = "" + scrambleRequest.totalAttempt
                list.add(Translate.translate("fmc.scrambleXofY", locale, substitutions))
                alignList.add(Element.ALIGN_CENTER)
            }
        } else {
            list.add(Translate.translate("fmc.competition", locale) + longFill)
            alignList.add(Element.ALIGN_LEFT)
            list.add(Translate.translate("fmc.round", locale) + shortFill)
            alignList.add(Element.ALIGN_LEFT)
            list.add(Translate.translate("fmc.attempt", locale) + shortFill)
            alignList.add(Element.ALIGN_LEFT)
        }
        if (withScramble) { // more space for filling name
            list.add("")
            alignList.add(Element.ALIGN_LEFT)
        }
        list.add(Translate.translate("fmc.competitor", locale) + longFill)
        alignList.add(Element.ALIGN_LEFT)
        if (withScramble) {
            list.add("")
            alignList.add(Element.ALIGN_LEFT)
        }
        list.add("WCA ID: __ __ __ __  __ __ __ __  __ __")
        alignList.add(Element.ALIGN_LEFT)
        if (withScramble) { // add space below
            list.add("")
            alignList.add(Element.ALIGN_LEFT)
        }

        cb.populateRect(competitorInfoRect, list, alignList, bf, fontSize)

        // graded
        fontSize = 11
        list = ArrayList()
        alignList = ArrayList()
        list.add(Translate.translate("fmc.warning", locale))
        alignList.add(Element.ALIGN_CENTER)
        list.add(Translate.translate("fmc.graded", locale) + longFill + " " + Translate.translate("fmc.result", locale) + shortFill)
        alignList.add(Element.ALIGN_CENTER)
        fontSize = 11
        cb.populateRect(gradeRect, list, alignList, bf, fontSize)

        if (!withScramble) {
            fontSize = 11

            list = ArrayList()
            alignList = ArrayList()

            list.add("") // fake vertical centering
            alignList.add(Element.ALIGN_CENTER)

            list.add(Translate.translate("fmc.scrambleOnSeparateSheet", locale))
            alignList.add(Element.ALIGN_CENTER)

            cb.populateRect(scrambleImageRect, list, alignList, bf, fontSize)
        }

        val fmcMargin = 10

        // Table
        val tableWidth = competitorInfoLeft - left - 2 * fmcMargin
        val tableHeight = 160
        val tableLines = 8
        val cellWidth = 25
        val cellHeight = tableHeight / tableLines
        val columns = 7
        val firstColumnWidth = tableWidth - (columns - 1) * cellWidth

        val movesFontSize = 10
        val movesFont = Font(bf, movesFontSize.toFloat())

        val table = PdfPTable(columns)
        table.setTotalWidth(floatArrayOf(firstColumnWidth.toFloat(), cellWidth.toFloat(), cellWidth.toFloat(), cellWidth.toFloat(), cellWidth.toFloat(), cellWidth.toFloat(), cellWidth.toFloat()))
        table.isLockedWidth = true

        val movesType = arrayOf(Translate.translate("fmc.faceMoves", locale), Translate.translate("fmc.rotations", locale))
        val direction = arrayOf(Translate.translate("fmc.clockwise", locale), Translate.translate("fmc.counterClockwise", locale), Translate.translate("fmc.double", locale))

        val directionModifiers = arrayOf("", "'", "2")
        val moves = arrayOf("F", "R", "U", "B", "L", "D")
        val movesCell = Array(movesType.size) { Array<Array<String?>>(direction.size) { arrayOfNulls(moves.size) } }

        // Face moves.
        for (i in directionModifiers.indices) {
            for (j in moves.indices) {
                movesCell[0][i][j] = moves[j] + directionModifiers[i]
            }
        }
        // Rotations.
        for (i in directionModifiers.indices) {
            for (j in moves.indices) {
                movesCell[1][i][j] = "[" + moves[j].toLowerCase() + directionModifiers[i] + "]"
            }
        }

        val firstColumnRectangle = Rectangle(firstColumnWidth.toFloat(), cellHeight.toFloat())
        var firstColumnFontSize = fitText(Font(bf), movesType[0], firstColumnRectangle, 10f, false, 1f)

        for (item in movesType) {
            firstColumnFontSize = Math.min(firstColumnFontSize, fitText(Font(bf, firstColumnFontSize, Font.BOLD), item, firstColumnRectangle, 10f, false, 1f))
        }
        for (item in direction) {
            firstColumnFontSize = Math.min(firstColumnFontSize, fitText(Font(bf, firstColumnFontSize), item, firstColumnRectangle, 10f, false, 1f))
        }

        // Center the table
        var maxFirstColumnWidth = 0f
        var maxLastColumnWidth = 0f

        for (i in movesType.indices) {

            maxFirstColumnWidth = Math.max(maxFirstColumnWidth, bf.getWidthPoint(movesType[i], firstColumnFontSize))

            var cell = PdfPCell(Phrase(movesType[i], Font(bf, firstColumnFontSize, Font.BOLD)))
            cell.fixedHeight = cellHeight.toFloat()
            cell.verticalAlignment = Element.ALIGN_MIDDLE
            cell.horizontalAlignment = Element.ALIGN_RIGHT
            cell.border = Rectangle.NO_BORDER
            table.addCell(cell)

            cell = PdfPCell(Phrase(""))
            cell.fixedHeight = cellHeight.toFloat()
            cell.colspan = columns - 1
            cell.border = Rectangle.NO_BORDER
            table.addCell(cell)

            for (j in directionModifiers.indices) {

                maxFirstColumnWidth = Math.max(maxFirstColumnWidth, bf.getWidthPoint(direction[j], firstColumnFontSize))

                cell = PdfPCell(Phrase(direction[j], Font(bf, firstColumnFontSize)))
                cell.fixedHeight = cellHeight.toFloat()
                cell.verticalAlignment = Element.ALIGN_MIDDLE
                cell.horizontalAlignment = Element.ALIGN_RIGHT
                cell.border = Rectangle.NO_BORDER
                table.addCell(cell)
                for (k in moves.indices) {
                    cell = PdfPCell(Phrase(movesCell[i][j][k], movesFont))
                    cell.fixedHeight = cellHeight.toFloat()
                    cell.verticalAlignment = Element.ALIGN_MIDDLE
                    cell.horizontalAlignment = Element.ALIGN_CENTER
                    cell.border = Rectangle.NO_BORDER
                    table.addCell(cell)

                    if (k == moves.size - 1) {
                        maxLastColumnWidth = Math.max(maxLastColumnWidth, bf.getWidthPoint(movesCell[i][j][k], movesFontSize.toFloat()))
                    }
                }
            }
        }

        // Position the table
        table.writeSelectedRows(0, -1, left.toFloat() + fmcMargin.toFloat() + (cellWidth - maxLastColumnWidth) / 2 - (firstColumnWidth - maxFirstColumnWidth) / 2, (scrambleBorderTop + tableHeight + fmcMargin).toFloat(), cb)

        // Rules
        val MAGIC_NUMBER = 30 // kill me now
        var leadingMultiplier = 1f
        fontSize = 25

        val rect = Rectangle(left.toFloat(), (top - MAGIC_NUMBER + fontSize).toFloat(), competitorInfoLeft.toFloat(), (top - MAGIC_NUMBER).toFloat())
        cb.fitAndShowText(Translate.translate("fmc.event", locale), bf, rect, fontSize.toFloat(), Element.ALIGN_CENTER, leadingMultiplier)

        val rulesList = ArrayList<String>()
        rulesList.add("• " + Translate.translate("fmc.rule1", locale))
        rulesList.add("• " + Translate.translate("fmc.rule2", locale))
        rulesList.add("• " + Translate.translate("fmc.rule3", locale))

        val maxMoves = WCA_MAX_MOVES_FMC

        val substitutions = HashMap<String, String>()
        substitutions["maxMoves"] = "" + maxMoves
        rulesList.add("• " + Translate.translate("fmc.rule4", locale, substitutions))

        rulesList.add("• " + Translate.translate("fmc.rule5", locale))
        rulesList.add("• " + Translate.translate("fmc.rule6", locale))

        val rulesTop = competitorInfoBottom + if (withScramble) 65 else 153

        leadingMultiplier = 1.5f
        val rulesRectangle = Rectangle((left + fmcMargin).toFloat(), (scrambleBorderTop + tableHeight + fmcMargin).toFloat(), (competitorInfoLeft - fmcMargin).toFloat(), (rulesTop + fmcMargin).toFloat())
        val rules = rulesList.joinToString("\n")
        cb.fitAndShowText(rules, bf, rulesRectangle, 15f, Element.ALIGN_JUSTIFIED, leadingMultiplier)

        doc.newPage()
    }

    fun createTable(docWriter: PdfWriter, doc: Document, sideMargins: Float, scrambleImageSize: Dimension, scrambles: List<String>, scrambler: Puzzle, colorScheme: HashMap<String, Color>?, scrambleNumberPrefix: String, forceHighlighting: Boolean): TableAndHighlighting {
        val cb = docWriter.directContent

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

        val availableWidth = doc.pageSize.width - sideMargins
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

            val paddedScramble = padTurnsUniformly(scramble, "M")
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
        var scrambleFont: Font? = null

        val availableArea = Rectangle(scrambleColumnWidth - 2 * SCRAMBLE_PADDING_HORIZONTAL,
            (availableScrambleHeight - SCRAMBLE_PADDING_VERTICAL_TOP - SCRAMBLE_PADDING_VERTICAL_BOTTOM).toFloat())
        var perfectFontSize = fitText(Font(MONO_FONT), longestPaddedScramble, availableArea, MAX_SCRAMBLE_FONT_SIZE, true, leadingMultiplier)
        if (tryToFitOnOneLine) {
            val longestScrambleOneLine = longestScramble.replace(".".toRegex(), widestCharacter + "")
            val perfectFontSizeForOneLine = fitText(Font(MONO_FONT), longestScrambleOneLine, availableArea, MAX_SCRAMBLE_FONT_SIZE, false, leadingMultiplier)
            oneLine = perfectFontSizeForOneLine >= MINIMUM_ONE_LINE_FONT_SIZE
            if (oneLine) {
                perfectFontSize = perfectFontSizeForOneLine
            }
        }
        scrambleFont = Font(MONO_FONT, perfectFontSize, Font.NORMAL)

        var highlight = forceHighlighting
        for (i in scrambles.indices) {
            val scramble = scrambles[i]
            val paddedScramble = if (oneLine) scramble else padTurnsUniformly(scramble, NON_BREAKING_SPACE + "")
            val ch = Chunk(scrambleNumberPrefix + (i + 1) + ".")
            val nthscramble = PdfPCell(Paragraph(ch))
            nthscramble.verticalAlignment = PdfPCell.ALIGN_MIDDLE
            table.addCell(nthscramble)

            val scramblePhrase = Phrase()
            var nthLine = 1
            val lineChunks = splitTextToLineChunks(paddedScramble, scrambleFont, scrambleColumnWidth)
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

    fun addGenericFmcSolutionSheet(docWriter: PdfWriter, doc: Document, request: ScrambleRequest, globalTitle: String?, locale: Locale) {
        addFmcSolutionSheet(docWriter, doc, request, globalTitle, -1, locale)
    }

    fun addFmcScrambleCutoutSheet(docWriter: PdfWriter, doc: Document, scrambleRequest: ScrambleRequest, globalTitle: String?, index: Int) {
        val pageSize = doc.pageSize
        val scramble = scrambleRequest.scrambles[index]
        val cb = docWriter.directContent

        val bf = getFontForLocale(Translate.DEFAULT_LOCALE)

        val bottom = 10
        val left = 20
        val right = (pageSize.width - left).toInt()
        val top = (pageSize.height - bottom).toInt()

        val height = top - bottom
        val width = right - left

        val spaceScrambleImage = 5 // scramble image won't touch the scramble
        val scrambleImagePadding = 8 // scramble image won't touch the dashed lines
        val fontSize = 20

        val scramblesPerSheet = 8
        val availableScrambleHeight = height / scramblesPerSheet

        val availableScrambleWidth = (width * .45).toInt()
        val dim = scrambleRequest.scrambler.getPreferredSize(availableScrambleWidth, availableScrambleHeight - 2 * scrambleImagePadding)
        val tp = cb.createTemplate(dim.width.toFloat(), dim.height.toFloat())
        val g2 = PdfGraphics2D(tp, dim.width.toFloat(), dim.height.toFloat(), DefaultFontMapper())

        try {
            val svg = scrambleRequest.scrambler.drawScramble(scramble, scrambleRequest.colorScheme)
            g2.drawSvg(svg, dim)
        } finally {
            g2.dispose()
        }

        var title = globalTitle + " - " + scrambleRequest.title
        if (scrambleRequest.scrambles.size > 1) {
            title += " - Scramble " + (index + 1) + " of " + scrambleRequest.scrambles.size
        }

        val list = ArrayList<String>()
        val alignList = ArrayList<Int>()

        list.add("") // space above
        alignList.add(Element.ALIGN_LEFT)

        list.add(title)
        alignList.add(Element.ALIGN_LEFT)
        list.add(scramble)
        alignList.add(Element.ALIGN_LEFT)

        list.add("") // space bellow
        alignList.add(Element.ALIGN_LEFT)

        for (i in 0 until scramblesPerSheet) {
            val rect = Rectangle(left.toFloat(), (top - i * availableScrambleHeight).toFloat(), (right - dim.width - spaceScrambleImage).toFloat(), (top - (i + 1) * availableScrambleHeight).toFloat())
            cb.populateRect(rect, list, alignList, bf, fontSize)

            cb.addImage(Image.getInstance(tp), dim.width.toDouble(), 0.0, 0.0, dim.height.toDouble(), (right - dim.width).toDouble(), top.toDouble() - (i + 1) * availableScrambleHeight + (availableScrambleHeight - dim.getHeight()) / 2)

            cb.drawDashedLine(left, right, top - i * availableScrambleHeight)
        }
        cb.drawDashedLine(left, right, top - scramblesPerSheet * availableScrambleHeight)

        doc.newPage()
    }
}
