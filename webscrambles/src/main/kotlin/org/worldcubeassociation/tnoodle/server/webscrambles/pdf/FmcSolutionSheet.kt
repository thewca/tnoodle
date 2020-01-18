package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.*
import com.itextpdf.text.pdf.PdfContentByte
import com.itextpdf.text.pdf.PdfPCell
import com.itextpdf.text.pdf.PdfPTable
import com.itextpdf.text.pdf.PdfWriter
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfDrawUtil.renderSvgToPDF
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfDrawUtil.fitAndShowText
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfDrawUtil.populateRect
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.FontUtil
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfUtil
import java.util.*
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.min

open class FmcSolutionSheet(request: ScrambleRequest, globalTitle: String?, locale: Locale) : FmcSheet(request, globalTitle, locale) {
    override fun PdfWriter.writeContents() {
        for (i in scrambleRequest.scrambles.indices) {
            addFmcSolutionSheet(document, scrambleRequest, title, i, locale)
            document.newPage()
        }
    }

    protected fun PdfWriter.addFmcSolutionSheet(doc: Document, scrambleRequest: ScrambleRequest, globalTitle: String?, index: Int, locale: Locale) {
        val withScramble = index != -1
        val pageSize = doc.pageSize

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
        val linesY = ceil(1.0 * WCA_MAX_MOVES_FMC / linesX).toInt()

        cb.setLineWidth(FMC_LINE_THICKNESS)
        cb.stroke()

        val excessX = availableSolutionWidth - linesX * lineWidth

        for (y in 0 until linesY) {
            for (x in 0 until linesX) {
                val moveCount = y * linesY + x

                if (moveCount >= WCA_MAX_MOVES_FMC) {
                    break
                }

                val xPos = left + x * lineWidth + (x + 1) * excessX / (linesX + 1)
                val yPos = (if (withScramble) solutionBorderTop else scrambleBorderTop) - (y + 1) * availableSolutionHeight / (linesY + 1)

                cb.moveTo(xPos.toFloat(), yPos.toFloat())
                cb.lineTo((xPos + lineWidth).toFloat(), yPos.toFloat())
            }
        }

        cb.setLineWidth(UNDERLINE_THICKNESS)
        cb.stroke()

        if (withScramble) {
            val scramble = scrambleRequest.scrambles[index]

            cb.beginText()
            val scrambleStr = Translate.translate("fmc.scramble", locale) + ": " + scramble

            val availableScrambleSpace = right - left - 2 * padding

            val scrambleFontSizes = 0 until 20
            val scrambleFontSize = scrambleFontSizes.reversed().find {
                bf.getWidthPoint(scrambleStr, it.toFloat()) <= availableScrambleSpace
            } ?: 20

            cb.setFontAndSize(bf, scrambleFontSize.toFloat())
            val scrambleY = 3 + solutionBorderTop + (scrambleBorderTop - solutionBorderTop - scrambleFontSize) / 2
            cb.showTextAligned(PdfContentByte.ALIGN_LEFT, scrambleStr, (left + padding).toFloat(), scrambleY.toFloat(), 0f)
            cb.endText()

            val availableScrambleWidth = right - competitorInfoLeft
            val availableScrambleHeight = gradeBottom - scrambleBorderTop

            val dim = scrambleRequest.scrambler.getPreferredSize(availableScrambleWidth - 2, availableScrambleHeight - 2)
            val svg = scrambleRequest.scrambler.drawScramble(scramble, scrambleRequest.colorScheme)
            val tp = cb.renderSvgToPDF(svg, dim)

            cb.addImage(Image.getInstance(tp), dim.width.toFloat(), 0f, 0f, dim.height.toFloat(), (competitorInfoLeft + (availableScrambleWidth - dim.width) / 2).toFloat(), (scrambleBorderTop + (availableScrambleHeight - dim.height) / 2).toFloat())
        }

        val fontSize = 15
        val margin = 5
        val showScrambleCount = withScramble && (scrambleRequest.scrambles.size > 1 || scrambleRequest.totalAttempt > 1)

        val competitorInfoRect = Rectangle((competitorInfoLeft + margin).toFloat(), top.toFloat(), (right - margin).toFloat(), competitorInfoBottom.toFloat())
        val gradeRect = Rectangle((competitorInfoLeft + margin).toFloat(), competitorInfoBottom.toFloat(), (right - margin).toFloat(), gradeBottom.toFloat())
        val scrambleImageRect = Rectangle((competitorInfoLeft + margin).toFloat(), gradeBottom.toFloat(), (right - margin).toFloat(), scrambleBorderTop.toFloat())

        val personalDetailsItems = mutableListOf<Pair<String, Int>>()

        if (withScramble) {
            personalDetailsItems.add(globalTitle!! to Element.ALIGN_CENTER)
            personalDetailsItems.add(scrambleRequest.title to Element.ALIGN_CENTER)

            if (showScrambleCount) {
                // this is for ordered scrambles
                val attemptIndex = scrambleRequest.takeIf { it.totalAttempt > 1 }?.attempt ?: index
                val orderedIndex = max(attemptIndex, index + 1)

                val absoluteTotal = scrambleRequest.totalAttempt.takeIf { it > 1 } ?: scrambleRequest.scrambles.size

                val substitutions = mapOf(
                    "scrambleIndex" to orderedIndex.toString(),
                    "scrambleCount" to absoluteTotal.toString()
                )

                val translatedInfo = Translate.translate("fmc.scrambleXofY", locale, substitutions)
                personalDetailsItems.add(translatedInfo to Element.ALIGN_CENTER)
            }
        } else {
            val competitionDesc = Translate.translate("fmc.competition", locale) + LONG_FILL
            val roundDesc = Translate.translate("fmc.round", locale) + SHORT_FILL
            val attemptDesc = Translate.translate("fmc.attempt", locale) + SHORT_FILL

            personalDetailsItems.add(competitionDesc to Element.ALIGN_LEFT)
            personalDetailsItems.add(roundDesc to Element.ALIGN_LEFT)
            personalDetailsItems.add(attemptDesc to Element.ALIGN_LEFT)
        }

        if (withScramble) { // more space for filling name
            personalDetailsItems.add("" to Element.ALIGN_LEFT)
        }

        val competitorDesc = Translate.translate("fmc.competitor", locale) + LONG_FILL
        personalDetailsItems.add(competitorDesc to Element.ALIGN_LEFT)

        if (withScramble) {
            personalDetailsItems.add("" to Element.ALIGN_LEFT)
        }

        personalDetailsItems.add(FORM_TEMPLATE_WCA_ID to Element.ALIGN_LEFT)

        if (withScramble) { // add space below
            personalDetailsItems.add("" to Element.ALIGN_LEFT)
        }

        val registrantIdDesc = Translate.translate("fmc.registrantId", locale) + SHORT_FILL
        personalDetailsItems.add(registrantIdDesc to Element.ALIGN_LEFT)

        if (withScramble) {
            personalDetailsItems.add("" to Element.ALIGN_LEFT)
        }

        cb.populateRect(competitorInfoRect, personalDetailsItems, bf, fontSize)

        // graded
        val gradingTextGradedBy = Translate.translate("fmc.graded", locale) + LONG_FILL
        val gradingTextResult = Translate.translate("fmc.result", locale) + SHORT_FILL

        val gradingText = "$gradingTextGradedBy $gradingTextResult"
        val warningText = Translate.translate("fmc.warning", locale)

        val gradingItemsWithAlignment = listOf(
            warningText to Element.ALIGN_CENTER,
            gradingText to Element.ALIGN_CENTER
        )

        cb.populateRect(gradeRect, gradingItemsWithAlignment, bf, 11) // FIXME const

        if (!withScramble) {
            val separateSheetAdvice = Translate.translate("fmc.scrambleOnSeparateSheet", locale)

            val separateSheetAdviceItems = listOf(
                "" to Element.ALIGN_CENTER,
                separateSheetAdvice to Element.ALIGN_CENTER
            )

            cb.populateRect(scrambleImageRect, separateSheetAdviceItems, bf, 11) // FIXME const
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

        val table = PdfPTable(columns).apply {
            setTotalWidth(floatArrayOf(firstColumnWidth.toFloat(), cellWidth.toFloat(), cellWidth.toFloat(), cellWidth.toFloat(), cellWidth.toFloat(), cellWidth.toFloat(), cellWidth.toFloat()))
            isLockedWidth = true
        }

        val movesType = listOf(
            Translate.translate("fmc.faceMoves", locale),
            Translate.translate("fmc.rotations", locale)
        )

        val direction = listOf(
            Translate.translate("fmc.clockwise", locale),
            Translate.translate("fmc.counterClockwise", locale),
            Translate.translate("fmc.double", locale)
        )

        val pureMoves = DIRECTION_MODIFIERS.map { mod -> WCA_MOVES.map { mov -> "$mov$mod" } }
        val rotationMoves = DIRECTION_MODIFIERS.map { mod -> WCA_MOVES.map { mov -> "[${mov.toLowerCase()}$mod]" } }

        val movesCell = listOf(pureMoves, rotationMoves)

        val firstColumnRectangle = Rectangle(firstColumnWidth.toFloat(), cellHeight.toFloat())
        val firstColumnBaseFontSize = PdfUtil.fitText(Font(bf), movesType[0], firstColumnRectangle, 10f, false, 1f)

        val movesTypeMinFont = movesType.map { PdfUtil.fitText(Font(bf, firstColumnBaseFontSize, Font.BOLD), it, firstColumnRectangle, 10f, false, 1f) }
            .min() ?: firstColumnBaseFontSize

        val directionMinFont = direction.map { PdfUtil.fitText(Font(bf, firstColumnBaseFontSize), it, firstColumnRectangle, 10f, false, 1f) }
            .min() ?: firstColumnBaseFontSize

        val firstColumnFontSize = min(firstColumnBaseFontSize, min(movesTypeMinFont, directionMinFont))

        // Center the table
        val movesTypeMaxWidth = movesType.map { bf.getWidthPoint(it, firstColumnFontSize) }.max() ?: 0f
        val directionMaxWidth = direction.map { bf.getWidthPoint(it, firstColumnFontSize) }.max() ?: 0f
        val maxFirstColumnWidth = max(movesTypeMaxWidth, directionMaxWidth)

        val lastColumnValues = movesCell.flatMap { c -> c.map { it.last() } }
        val maxLastColumnWidth = lastColumnValues.map { bf.getWidthPoint(it, movesFontSize.toFloat()) }.max() ?: 0f

        for (i in movesType.indices) {
            val explanationStringCell = PdfPCell(Phrase(movesType[i], Font(bf, firstColumnFontSize, Font.BOLD))).apply {
                fixedHeight = cellHeight.toFloat()
                verticalAlignment = Element.ALIGN_MIDDLE
                horizontalAlignment = Element.ALIGN_RIGHT
                border = Rectangle.NO_BORDER
            }

            table.addCell(explanationStringCell)

            val emptyCell = PdfPCell(Phrase("")).apply {
                fixedHeight = cellHeight.toFloat()
                colspan = columns - 1
                border = Rectangle.NO_BORDER
            }

            table.addCell(emptyCell)

            for (j in DIRECTION_MODIFIERS.indices) {
                val directionTitleCell = PdfPCell(Phrase(direction[j], Font(bf, firstColumnFontSize))).apply {
                    fixedHeight = cellHeight.toFloat()
                    verticalAlignment = Element.ALIGN_MIDDLE
                    horizontalAlignment = Element.ALIGN_RIGHT
                    border = Rectangle.NO_BORDER
                }

                table.addCell(directionTitleCell)

                for (k in WCA_MOVES.indices) {
                    val moveStringCell = PdfPCell(Phrase(movesCell[i][j][k], movesFont)).apply {
                        fixedHeight = cellHeight.toFloat()
                        verticalAlignment = Element.ALIGN_MIDDLE
                        horizontalAlignment = Element.ALIGN_CENTER
                        border = Rectangle.NO_BORDER
                    }

                    table.addCell(moveStringCell)
                }
            }
        }

        // Position the table
        table.writeSelectedRows(0, -1, left.toFloat() + fmcMargin.toFloat() + (cellWidth - maxLastColumnWidth) / 2 - (firstColumnWidth - maxFirstColumnWidth) / 2, (scrambleBorderTop + tableHeight + fmcMargin).toFloat(), cb)

        // Rules
        val leadingMultiplier = 1f
        val ruleFontSize = 25

        val rect = Rectangle(left.toFloat(), (top - MAGIC_NUMBER + ruleFontSize).toFloat(), competitorInfoLeft.toFloat(), (top - MAGIC_NUMBER).toFloat())
        cb.fitAndShowText(Translate.translate("fmc.event", locale), bf, rect, ruleFontSize.toFloat(), Element.ALIGN_CENTER, leadingMultiplier)

        val substitutions = mapOf("maxMoves" to WCA_MAX_MOVES_FMC.toString())

        val rulesList = listOf(
            Translate.translate("fmc.rule1", locale),
            Translate.translate("fmc.rule2", locale),
            Translate.translate("fmc.rule3", locale),
            Translate.translate("fmc.rule4", locale, substitutions),
            Translate.translate("fmc.rule5", locale),
            Translate.translate("fmc.rule6", locale)
        )

        val rulesTop = competitorInfoBottom + if (withScramble) 65 else 153

        val rulesRectangle = Rectangle((left + fmcMargin).toFloat(), (scrambleBorderTop + tableHeight + fmcMargin).toFloat(), (competitorInfoLeft - fmcMargin).toFloat(), (rulesTop + fmcMargin).toFloat())
        val rules = rulesList.joinToString("\n") { "• $it" }

        cb.fitAndShowText(rules, bf, rulesRectangle, 15f, Element.ALIGN_JUSTIFIED, 1.5f) // TODO const

        doc.newPage()
    }

    companion object {
        const val FMC_LINE_THICKNESS = 0.5f

        const val UNDERLINE_THICKNESS = 0.2f

        const val MAGIC_NUMBER = 30 // kill me now

        const val FORM_TEMPLATE_WCA_ID = "WCA ID: __ __ __ __  __ __ __ __  __ __"

        const val SHORT_FILL = ": ____"
        const val LONG_FILL = ": __________________"

        val WCA_MOVES = arrayOf("F", "R", "U", "B", "L", "D")
        val DIRECTION_MODIFIERS = arrayOf("", "'", "2")
    }
}
