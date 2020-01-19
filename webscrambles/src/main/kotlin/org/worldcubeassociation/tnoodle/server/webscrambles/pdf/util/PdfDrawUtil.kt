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
import net.gnehzr.tnoodle.svglite.Dimension
import net.gnehzr.tnoodle.svglite.Svg
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

            val chartGfx = GVTBuilder().build(ctx, parsedSvgDocument)

            val actualSize = svg.size

            val scaleWidth = dim.width.toDouble() / actualSize.width
            val scaleHeight = dim.height.toDouble() / actualSize.height

            chartGfx.transform = AffineTransform.getScaleInstance(scaleWidth, scaleHeight)

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
        // We create a temp pdf and check if the text fit in a rectangle there.
        val tempCb = PdfContentByte(pdfWriter)
        val status = tempCb.showTextStatus(text, rect, font, align, leadingMultiplier)

        if (ColumnText.hasMoreText(status)) {
            val iterMaxFontSize = font.size - 0.1f
            val iterFont = Font(font.baseFont, iterMaxFontSize)
            // FIXME brute-force approach doesn't seem healthy
            return fitAndShowText(text, rect, iterFont, align, leadingMultiplier)
        }

        // TODO see if we can recycle "status" from above if not drawn on a separate canvas
        return showTextStatus(text, rect, font, align, leadingMultiplier)
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

    fun PdfContentByte.populateRect(rect: Rectangle, itemsWithAlignment: List<Pair<String, Int>>, font: Font) {
        val totalHeight = rect.height
        val width = rect.width

        val x = rect.left
        val y = rect.top

        val height = totalHeight / itemsWithAlignment.size

        for ((i, content) in itemsWithAlignment.withIndex()) {
            val temp = Rectangle(x, y + height * i - totalHeight - font.size, x + width, y + height * i - totalHeight)
            fitAndShowText(content.first, temp, font, content.second)
        }
    }
}
