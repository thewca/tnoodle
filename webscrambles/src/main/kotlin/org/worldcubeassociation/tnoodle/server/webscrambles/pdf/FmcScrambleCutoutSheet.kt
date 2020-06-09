package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.*
import com.itextpdf.text.pdf.PdfWriter
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfDrawUtil.drawDashedLine
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfDrawUtil.renderSvgToPDF
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfDrawUtil.populateRect
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.FontUtil
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*

class FmcScrambleCutoutSheet(scrambleSet: ScrambleSet, activityCode: ActivityCode, competitionTitle: String) : FmcSheet(scrambleSet, activityCode, competitionTitle) {
    override fun PdfWriter.writeContents(document: Document) {
        for (i in scrambleSet.scrambles.indices) {
            addFmcScrambleCutoutSheet(document, i)
            document.newPage()
        }
    }

    private fun PdfWriter.addFmcScrambleCutoutSheet(document: Document, index: Int) {
        val pageSize = document.pageSize
        val scrambleModel = scrambleSet.scrambles[index]
        val scramble = scrambleModel.allScrambleStrings.single() // we assume FMC only has one scramble

        val right = (pageSize.width - LEFT).toInt()
        val top = (pageSize.height - BOTTOM).toInt()

        val height = top - BOTTOM
        val width = right - LEFT

        val availableScrambleHeight = height / SCRAMBLES_PER_SHEET

        val availableScrambleWidth = (width * .45).toInt()
        val availablePaddedScrambleHeight = availableScrambleHeight - 2 * SCRAMBLE_IMAGE_PADDING

        val dim = scramblingPuzzle.getPreferredSize(availableScrambleWidth, availablePaddedScrambleHeight)
        val svg = scramblingPuzzle.drawScramble(scramble, null)

        val tp = directContent.renderSvgToPDF(svg, dim)

        val scrambleSuffix = " - Scramble ${index + 1} of $expectedAttemptNum"
            .takeIf { expectedAttemptNum > 1 } ?: ""

        val attemptTitle = activityCode.compileTitleString(locale)
        val title = "$competitionTitle - $attemptTitle$scrambleSuffix"

        // empty strings for space above and below
        val textList = listOf("", title, scramble, "")
        val alignList = List(textList.size) { Element.ALIGN_LEFT }

        val paddedTitleItems = textList.zip(alignList)

        val font = Font(BASE_FONT, FONT_SIZE)

        for (i in 0 until SCRAMBLES_PER_SHEET) {
            val rect = Rectangle(LEFT.toFloat(), (top - i * availableScrambleHeight).toFloat(), (right - dim.width - SPACE_SCRAMBLE_IMAGE).toFloat(), (top - (i + 1) * availableScrambleHeight).toFloat())
            directContent.populateRect(rect, paddedTitleItems, font)

            directContent.addImage(Image.getInstance(tp), dim.width.toDouble(), 0.0, 0.0, dim.height.toDouble(), (right - dim.width).toDouble(), top.toDouble() - (i + 1) * availableScrambleHeight + (availableScrambleHeight - dim.getHeight()) / 2)

            directContent.drawDashedLine(LEFT, right, top - i * availableScrambleHeight)
        }

        directContent.drawDashedLine(LEFT, right, top - SCRAMBLES_PER_SHEET * availableScrambleHeight)
    }

    companion object {
        val BASE_FONT = FontUtil.getFontForLocale(Translate.DEFAULT_LOCALE)

        val BOTTOM = 10
        val LEFT = 20

        val SPACE_SCRAMBLE_IMAGE = 5 // scramble image won't touch the scramble
        val SCRAMBLE_IMAGE_PADDING = 8 // scramble image won't touch the dashed lines

        val FONT_SIZE = 20f

        val SCRAMBLES_PER_SHEET = 8
    }
}
