package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util

import com.itextpdf.awt.DefaultFontMapper
import com.itextpdf.awt.PdfGraphics2D
import com.itextpdf.text.Element
import com.itextpdf.text.Font
import com.itextpdf.text.Paragraph
import com.itextpdf.text.Rectangle
import com.itextpdf.text.pdf.ColumnText
import com.itextpdf.text.pdf.PdfContentByte
import com.itextpdf.text.pdf.PdfTemplate
import org.worldcubeassociation.tnoodle.svglite.Dimension
import org.worldcubeassociation.tnoodle.svglite.Svg
import org.apache.batik.anim.dom.SAXSVGDocumentFactory
import org.apache.batik.bridge.BridgeContext
import org.apache.batik.bridge.DocumentLoader
import org.apache.batik.bridge.GVTBuilder
import org.apache.batik.bridge.UserAgentAdapter
import org.apache.batik.util.XMLResourceDescriptor
import java.awt.geom.AffineTransform

object PdfDrawUtil {
    fun PdfContentByte.renderSvgToPDF(svg: Svg, dim: Dimension, padding: Int = 0): PdfTemplate {
        val tp = createTemplate(dim.width.toFloat() + 2 * padding, dim.height.toFloat() + 2 * padding)
        val g2 = PdfGraphics2D(tp, tp.width, tp.height, DefaultFontMapper())

        if (padding > 0) {
            g2.translate(padding, padding)
        }

        try {
            // Copied (and modified) from http://stackoverflow.com/a/12502943
            val userAgent = UserAgentAdapter()

            val loader = DocumentLoader(userAgent)
            val ctx = BridgeContext(userAgent, loader).apply { setDynamicState(BridgeContext.DYNAMIC) }

            val parser = XMLResourceDescriptor.getXMLParserClassName()
            val factory = SAXSVGDocumentFactory(parser)

            val parsedSvgDocument = factory.createSVGDocument(null, svg.toString().reader())

            val scaleWidth = dim.width.toDouble() / svg.size.width
            val scaleHeight = dim.height.toDouble() / svg.size.height

            val chartGfx = GVTBuilder().build(ctx, parsedSvgDocument)
                .apply { transform = AffineTransform.getScaleInstance(scaleWidth, scaleHeight) }

            chartGfx.paint(g2)
        } finally {
            g2.dispose() // iTextPdf blows up if we do not dispose of this
        }

        return tp
    }

    fun PdfContentByte.drawDashedLine(left: Int, right: Int, yPosition: Int) {
        setLineDash(3f, 3f)
        moveTo(left.toFloat(), yPosition.toFloat())
        lineTo(right.toFloat(), yPosition.toFloat())
        stroke()
    }

    fun PdfContentByte.fitAndShowText(text: String, rect: Rectangle, font: Font, align: Int = Element.ALIGN_LEFT, leadingMultiplier: Float = 1f): Int {
        val approxFontSize = PdfUtil.binarySearchDec(1f, font.size, PdfUtil.FITTEXT_FONTSIZE_PRECISION) {
            val iterFont = Font(font.baseFont, it)

            // We create a temp pdf and check if the text fit in a rectangle there.
            val tempCb = PdfContentByte(pdfWriter)
            val status = tempCb.showTextStatus(text, rect, iterFont, align, leadingMultiplier)

            ColumnText.hasMoreText(status)
        }

        val approxFont = Font(font.baseFont, approxFontSize)
        return showTextStatus(text, rect, approxFont, align, leadingMultiplier)
    }

    private fun PdfContentByte.showTextStatus(text: String, rect: Rectangle, font: Font, align: Int, leadingMultiplier: Float): Int {
        // If it's ok, we add the text to original pdf.
        val ct = ColumnText(this).apply {
            insertTextParagraph(text, rect, font, align, leadingMultiplier)
        }

        return ct.go()
    }

    private fun ColumnText.insertTextParagraph(text: String, rect: Rectangle, font: Font, align: Int = Element.ALIGN_LEFT, leadingMultiplier: Float = 1f) {
        setSimpleColumn(rect)
        leading = leadingMultiplier * font.size
        alignment = align
        addText(Paragraph(text, font))
    }

    fun PdfContentByte.populateRect(rect: Rectangle, itemsWithAlignment: List<Pair<String, Int>>, font: Font, leadingMultiplier: Float = 1f) {
        val mergedItemsWithAlignment = itemsWithAlignment.map { Triple(it.first, font, it.second) }
        populateRect(rect, mergedItemsWithAlignment, leadingMultiplier)
    }

    fun PdfContentByte.populateRect(rect: Rectangle, itemsWithAlignment: List<Triple<String, Font, Int>>, leadingMultiplier: Float = 1f) {
        val fontPoints = itemsWithAlignment.map { it.second.size }
        val totalFontPoints = fontPoints.sum()

        val slotHeights = fontPoints.map { it / totalFontPoints }.map { it * rect.height }

        for ((i, content) in itemsWithAlignment.withIndex()) {
            val height = slotHeights.subList(0, i).sum()
            val proportionalFontSize = -slotHeights[i]

            val temp = Rectangle(rect.left, rect.bottom + height - proportionalFontSize, rect.right, rect.bottom + height)
            fitAndShowText(content.first, temp, content.second, content.third, leadingMultiplier)
        }
    }
}
