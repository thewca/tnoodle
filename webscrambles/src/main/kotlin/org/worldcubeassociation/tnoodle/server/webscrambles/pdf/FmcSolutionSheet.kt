package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.awt.DefaultFontMapper
import com.itextpdf.awt.PdfGraphics2D
import com.itextpdf.text.*
import com.itextpdf.text.pdf.PdfContentByte
import com.itextpdf.text.pdf.PdfPCell
import com.itextpdf.text.pdf.PdfPTable
import com.itextpdf.text.pdf.PdfWriter
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfDrawUtil.drawSvg
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfDrawUtil.fitAndShowText
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfDrawUtil.populateRect
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.FontUtil
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfUtil
import java.util.*

open class FmcSolutionSheet(request: ScrambleRequest, globalTitle: String?, locale: Locale): FmcSheet(request, globalTitle, locale) {
    override fun PdfWriter.writeContents() {
        for (i in scrambleRequest.scrambles.indices) {
            addFmcSolutionSheet(document, scrambleRequest, title, i, locale)
            document.newPage()
        }
    }

    protected fun PdfWriter.addFmcSolutionSheet(doc: Document, scrambleRequest: ScrambleRequest, globalTitle: String?, index: Int, locale: Locale) {
        var index = index
        val withScramble = index != -1
        val pageSize = doc.pageSize
        var scramble: String? = null
        if (withScramble) {
            scramble = scrambleRequest.scrambles[index]
        }
        val cb = directContent
        val bf = FontUtil.getFontForLocale(locale)

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

        cb.setLineWidth(FMC_LINE_THICKNESS)
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
                }

                val absoluteTotal = scrambleRequest.totalAttempt.takeIf { it > 1 } ?: scrambleRequest.scrambles.size

                val substitutions = mapOf(
                    "scrambleIndex" to (index + 1).toString(),
                    "scrambleCount" to absoluteTotal.toString()
                )

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
        list.add(Translate.translate("fmc.registrantId", locale) + shortFill)
        alignList.add(Element.ALIGN_LEFT)
        if (withScramble) {
            list.add("")
            alignList.add(Element.ALIGN_LEFT)
        }

        cb.populateRect(competitorInfoRect, list, alignList, bf, fontSize)

        // graded
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
        val moves = arrayOf("R", "U", "F", "L", "D", "B")
        val rotations = arrayOf("x", "y", "z", "", "", "")
        val movesCell = Array(movesType.size) { Array<Array<String?>>(direction.size) { arrayOfNulls(moves.size) } }

        // Face moves.
        for (i in directionModifiers.indices) {
            for (j in moves.indices) {
                movesCell[0][i][j] = moves[j] + directionModifiers[i]
            }
        }
        // Rotations.
        for (i in directionModifiers.indices) {
            for (j in rotations.indices) {
                if (!rotations[j].isBlank()) {
                    movesCell[1][i][j] = rotations[j].toLowerCase() + directionModifiers[i]
                } else {
                    movesCell[1][i][j] = "";
                }
            }
        }

        val firstColumnRectangle = Rectangle(firstColumnWidth.toFloat(), cellHeight.toFloat())
        var firstColumnFontSize = PdfUtil.fitText(Font(bf), movesType[0], firstColumnRectangle, 10f, false, 1f)

        for (item in movesType) {
            firstColumnFontSize = Math.min(firstColumnFontSize, PdfUtil.fitText(Font(bf, firstColumnFontSize, Font.BOLD), item, firstColumnRectangle, 10f, false, 1f))
        }
        for (item in direction) {
            firstColumnFontSize = Math.min(firstColumnFontSize, PdfUtil.fitText(Font(bf, firstColumnFontSize), item, firstColumnRectangle, 10f, false, 1f))
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

    companion object {
        const val FMC_LINE_THICKNESS = 0.5f
    }
}
