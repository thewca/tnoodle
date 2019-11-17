package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.Element
import com.itextpdf.text.Image
import com.itextpdf.text.Rectangle
import com.itextpdf.text.pdf.PdfWriter
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfDrawUtil.drawDashedLine
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfDrawUtil.renderSvgToPDF
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.PdfDrawUtil.populateRect
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.FontUtil

class FmcScrambleCutoutSheet(request: ScrambleRequest, globalTitle: String?): FmcSheet(request, globalTitle) {
    override fun PdfWriter.writeContents() {
        for (i in scrambleRequest.scrambles.indices) {
            addFmcScrambleCutoutSheet(scrambleRequest, title, i)
            document.newPage()
        }
    }

    private fun PdfWriter.addFmcScrambleCutoutSheet(scrambleRequest: ScrambleRequest, globalTitle: String?, index: Int) {
        val pageSize = document.pageSize
        val scramble = scrambleRequest.scrambles[index]

        val right = (pageSize.width - LEFT).toInt()
        val top = (pageSize.height - BOTTOM).toInt()

        val height = top - BOTTOM
        val width = right - LEFT

        val availableScrambleHeight = height / SCRAMBLES_PER_SHEET

        val availableScrambleWidth = (width * .45).toInt()
        val availablePaddedScrambleHeight = availableScrambleHeight - 2 * SCRAMBLE_IMAGE_PADDING

        val dim = scrambleRequest.scrambler.getPreferredSize(availableScrambleWidth, availablePaddedScrambleHeight)
        val svg = scrambleRequest.scrambler.drawScramble(scramble, scrambleRequest.colorScheme)

        val tp = directContent.renderSvgToPDF(svg, dim)

        val scrambleSuffix = " - Scramble ${index + 1} of ${scrambleRequest.scrambles.size}"
            .takeIf { scrambleRequest.scrambles.size > 1 } ?: ""

        val title = "$globalTitle - ${scrambleRequest.title}$scrambleSuffix"

        // empty strings for space above and below
        val textList = listOf("", title, scramble, "")
        val alignList = List(textList.size) { Element.ALIGN_LEFT }

        val paddedTitleItems = textList.zip(alignList)

        for (i in 0 until SCRAMBLES_PER_SHEET) {
            val rect = Rectangle(LEFT.toFloat(), (top - i * availableScrambleHeight).toFloat(), (right - dim.width - SPACE_SCRAMBLE_IMAGE).toFloat(), (top - (i + 1) * availableScrambleHeight).toFloat())
            directContent.populateRect(rect, paddedTitleItems, BASE_FONT, FONT_SIZE)

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

        val FONT_SIZE = 20

        val SCRAMBLES_PER_SHEET = 8
    }
}
