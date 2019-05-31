package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.Font
import com.itextpdf.text.Paragraph
import com.itextpdf.text.Rectangle
import com.itextpdf.text.pdf.BaseFont
import com.itextpdf.text.pdf.ColumnText
import com.itextpdf.text.pdf.PdfContentByte
import net.gnehzr.tnoodle.svglite.Dimension
import net.gnehzr.tnoodle.svglite.Svg
import org.apache.batik.anim.dom.SAXSVGDocumentFactory
import org.apache.batik.bridge.BridgeContext
import org.apache.batik.bridge.DocumentLoader
import org.apache.batik.bridge.GVTBuilder
import org.apache.batik.bridge.UserAgentAdapter
import org.apache.batik.util.XMLResourceDescriptor
import java.awt.Graphics2D
import java.awt.geom.AffineTransform

object PdfDrawUtil {
    fun Graphics2D.drawSvg(svg: Svg, size: Dimension) {
        // Copied (and modified) from http://stackoverflow.com/a/12502943

        val userAgent = UserAgentAdapter()

        val loader = DocumentLoader(userAgent)
        val ctx = BridgeContext(userAgent, loader).apply { setDynamicState(BridgeContext.DYNAMIC) }

        val parser = XMLResourceDescriptor.getXMLParserClassName()
        val factory = SAXSVGDocumentFactory(parser)

        val parsedSvgDocument = factory.createSVGDocument(null, svg.toString().reader())

        val chartGfx = GVTBuilder().build(ctx, parsedSvgDocument)

        val actualSize = svg.size

        val scaleWidth = 1.0 * size.width / actualSize.width
        val scaleHeight = 1.0 * size.height / actualSize.height

        chartGfx.transform = AffineTransform.getScaleInstance(scaleWidth, scaleHeight)

        chartGfx.paint(this)
    }

    fun PdfContentByte.drawDashedLine(left: Int, right: Int, yPosition: Int) {
        setLineDash(3f, 3f)
        moveTo(left.toFloat(), yPosition.toFloat())
        lineTo(right.toFloat(), yPosition.toFloat())
        stroke()
    }

    fun PdfContentByte.fitAndShowText(text: String, bf: BaseFont, rect: Rectangle, maxFontSize: Float, align: Int, leadingMultiplier: Float): Int {
        val iterationThreshold = 0.1f
        var iterMaxFontSize = maxFontSize + iterationThreshold

        do {
            iterMaxFontSize -= iterationThreshold

            // We create a temp pdf and check if the text fit in a rectangle there.
            val tempCb = PdfContentByte(pdfWriter)

            val tempCt = ColumnText(tempCb).apply {
                insertTextParagraph(text, bf, rect, iterMaxFontSize, align, leadingMultiplier)
            }

            val status = tempCt.go()
        } while (ColumnText.hasMoreText(status))

        // If it's ok, we add the text to original pdf.
        val ct = ColumnText(this).apply {
            insertTextParagraph(text, bf, rect, iterMaxFontSize, align, leadingMultiplier)
        }

        return ct.go()
    }

    private fun ColumnText.insertTextParagraph(text: String, bf: BaseFont, rect: Rectangle, fontSize: Float, align: Int, leadingMultiplier: Float) {
        setSimpleColumn(rect)
        leading = leadingMultiplier * fontSize

        alignment = align

        addText(Paragraph(text, Font(bf, fontSize)))
    }

    fun PdfContentByte.populateRect(rect: Rectangle, list: List<String>, alignList: List<Int>, bf: BaseFont, fontSize: Int) {
        assert(list.size == alignList.size) { "Make sure that list and alignList are of the same size" }

        val totalHeight = rect.height
        val width = rect.width

        val x = rect.left
        val y = rect.top

        val height = totalHeight / list.size

        for (i in list.indices) {
            val temp = Rectangle(x, y + height * i - totalHeight - fontSize.toFloat(), x + width, y + height * i - totalHeight)
            fitAndShowText(list[i], bf, temp, 15f, alignList[i], 1f)
        }
    }
}
