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
import java.io.StringReader

object PdfDrawUtil {
    fun drawSvgToGraphics2D(svg: Svg, g2: Graphics2D, size: Dimension) {
        // Copied (and modified) from http://stackoverflow.com/a/12502943

        val parser = XMLResourceDescriptor.getXMLParserClassName()
        val factory = SAXSVGDocumentFactory(parser)
        val userAgent = UserAgentAdapter()
        val loader = DocumentLoader(userAgent)
        val ctx = BridgeContext(userAgent, loader)
        ctx.setDynamicState(BridgeContext.DYNAMIC)
        val builder = GVTBuilder()

        val svgReader = StringReader(svg.toString())
        val parsedSvgDocument = factory.createSVGDocument(null, svgReader)
        val chartGfx = builder.build(ctx, parsedSvgDocument)
        val actualSize = svg.size
        val scaleWidth = 1.0 * size.width / actualSize.width
        val scaleHeight = 1.0 * size.height / actualSize.height
        chartGfx.transform = AffineTransform.getScaleInstance(scaleWidth, scaleHeight)

        chartGfx.paint(g2)
    }

    fun drawDashedLine(cb: PdfContentByte, left: Int, right: Int, yPosition: Int) {
        cb.setLineDash(3f, 3f)
        cb.moveTo(left.toFloat(), yPosition.toFloat())
        cb.lineTo(right.toFloat(), yPosition.toFloat())
        cb.stroke()
    }

    fun fitAndShowText(cb: PdfContentByte, text: String, bf: BaseFont, rect: Rectangle, maxFontSize: Float, align: Int, leadingMultiplier: Float) {
        var maxFontSize = maxFontSize
        // We create a temp pdf and check if the text fit in a rectangle there.
        // If it's ok, we add the text to original pdf.

        do {
            val tempCb = PdfContentByte(cb.pdfWriter)

            val tempCt = ColumnText(tempCb)
            tempCt.setSimpleColumn(rect)
            tempCt.leading = leadingMultiplier * maxFontSize

            val p = Paragraph(text, Font(bf, maxFontSize))
            tempCt.addText(p)

            val status = tempCt.go()
            if (!ColumnText.hasMoreText(status)) { // all the text fit in the rectangle
                val ct = ColumnText(cb)
                ct.setSimpleColumn(rect)
                ct.alignment = align
                ct.leading = leadingMultiplier * maxFontSize
                ct.addText(p)
                ct.go()
                break
            }

            maxFontSize -= 0.1f
        } while (true)
    }

    fun populateRect(cb: PdfContentByte, rect: Rectangle, list: ArrayList<String>, alignList: ArrayList<Int>, bf: BaseFont, fontSize: Int) {
        assert(list.size == alignList.size) { "Make sure list.size() == alignList.size()" }

        val totalHeight = rect.height
        val width = rect.width
        val x = rect.left
        val y = rect.top

        val height = totalHeight / list.size

        for (i in list.indices) {
            val temp = Rectangle(x, y + height * i - totalHeight - fontSize.toFloat(), x + width, y + height * i - totalHeight)
            fitAndShowText(cb, list[i], bf, temp, 15f, alignList[i], 1f)
        }
    }
}
