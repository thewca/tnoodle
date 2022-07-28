package org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.engine

import com.itextpdf.awt.DefaultFontMapper
import com.itextpdf.awt.PdfGraphics2D
import com.itextpdf.text.*
import com.itextpdf.text.log.CounterFactory
import com.itextpdf.text.log.NoOpCounter
import com.itextpdf.text.pdf.*
import org.apache.batik.anim.dom.SAXSVGDocumentFactory
import org.apache.batik.bridge.BridgeContext
import org.apache.batik.bridge.DocumentLoader
import org.apache.batik.bridge.GVTBuilder
import org.apache.batik.bridge.UserAgentAdapter
import org.apache.batik.util.XMLResourceDescriptor
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.*
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.Document
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.Element
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.Paragraph
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.properties.*
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.properties.Font
import org.worldcubeassociation.tnoodle.svglite.Dimension
import org.worldcubeassociation.tnoodle.svglite.Svg
import java.awt.geom.AffineTransform
import java.io.ByteArrayOutputStream
import kotlin.math.roundToInt


object IText5Engine {
    init {
        // Email agpl@itextpdf.com if you want to know what this is about =)
        CounterFactory.getInstance().counter = NoOpCounter()
    }

    fun render(doc: Document): ByteArray {
        val pdfDocument = com.itextpdf.text.Document().apply {
            addCreationDate()
            addProducer()
            addTitle(doc.title)
        }

        val baos = ByteArrayOutputStream()

        val fontIndex = doc.exposeFontNames()
            .associateWith { BaseFont.createFont("fonts/$it.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED) }

        // iText 5 needs this line, otherwise the output will always appear blank
        val writer = PdfWriter.getInstance(pdfDocument, baos)

        for (page in doc.pages) {
            pdfDocument.pageSize = convertPageSize(page.size)

            pdfDocument.setMargins(
                page.marginLeft.toFloat(),
                page.marginRight.toFloat(),
                page.marginTop.toFloat(),
                page.marginBottom.toFloat()
            )

            // if we open _before_ the for-loop, stuff like setting page size and margins will have no effect :/
            pdfDocument.open()

            for (element in page.elements) {
                val itextElement = render(element, writer.directContent, fontIndex)
                pdfDocument.add(itextElement)
            }

            pdfDocument.newPage()
        }

        pdfDocument.close()

        return baos.toByteArray()
    }

    private fun convertPageSize(size: Paper.Size): Rectangle {
        return when (size) {
            Paper.Size.A4 -> PageSize.A4
        }
    }

    private fun convertColor(color: RgbColor): BaseColor {
        val alpha = (color.a * 255).roundToInt()
        return BaseColor(color.r, color.g, color.b, alpha)
    }

    private fun convertAlignment(align: Alignment.Horizontal): Int {
        return when (align) {
            Alignment.Horizontal.LEFT -> com.itextpdf.text.Element.ALIGN_LEFT
            Alignment.Horizontal.CENTER -> com.itextpdf.text.Element.ALIGN_CENTER
            Alignment.Horizontal.RIGHT -> com.itextpdf.text.Element.ALIGN_RIGHT
            Alignment.Horizontal.JUSTIFIED -> com.itextpdf.text.Element.ALIGN_JUSTIFIED
        }
    }

    private fun convertAlignment(align: Alignment.Vertical): Int {
        return when (align) {
            Alignment.Vertical.TOP -> com.itextpdf.text.Element.ALIGN_TOP
            Alignment.Vertical.MIDDLE -> com.itextpdf.text.Element.ALIGN_MIDDLE
            Alignment.Vertical.BOTTOM -> com.itextpdf.text.Element.ALIGN_BOTTOM
        }
    }

    private fun convertBorder(border: Drawing.Border): Int {
        return when (border) {
            Drawing.Border.FULL -> Rectangle.BOX
            Drawing.Border.ROWS_ONLY -> Rectangle.TOP + Rectangle.BOTTOM
            Drawing.Border.COLS_ONLY -> Rectangle.LEFT + Rectangle.RIGHT
            Drawing.Border.NONE -> Rectangle.NO_BORDER
        }
    }

    private fun convertFontStyle(style: Font.Weight): Int {
        return when (style) {
            Font.Weight.NORMAL -> com.itextpdf.text.Font.NORMAL
            Font.Weight.BOLD -> com.itextpdf.text.Font.BOLD
        }
    }

    private fun render(element: Element, cb: PdfContentByte, fontIndex: Map<String, BaseFont>): com.itextpdf.text.Element {
        return when (element) {
            is Table -> renderTable(element, cb, fontIndex)
            is Paragraph -> renderParagraph(element, fontIndex)
            is Text -> renderText(element, fontIndex)
            is SvgImage -> renderImage(element, cb)
            is Cell<*> -> renderCell(element, cb, fontIndex)
            else -> render(Text("Unsupported element $element"), cb, fontIndex)
        }
    }

    private fun renderTable(table: Table, cb: PdfContentByte, fontIndex: Map<String, BaseFont>): PdfPTable {
        val itextTable = PdfPTable(table.relativeColWidths.toFloatArray())
        itextTable.widthPercentage = 100f
        itextTable.keepTogether = true

        for (row in table.rows) {
            for (cell in row.cells) {
                val renderedCell = renderCell(cell, cb, fontIndex)
                itextTable.addCell(renderedCell)
            }
        }

        return itextTable
    }

    private fun <T : CellElement> renderCell(cell: Cell<T>, cb: PdfContentByte, fontIndex: Map<String, BaseFont>): PdfPCell {
        val itextCell = PdfPCell()
        itextCell.colspan = cell.colSpan
        itextCell.rowspan = cell.rowSpan
        itextCell.backgroundColor = cell.background?.let { convertColor(it) }
        itextCell.verticalAlignment = convertAlignment(cell.verticalAlignment)
        itextCell.horizontalAlignment = convertAlignment(cell.horizontalAlignment)
        itextCell.border = convertBorder(cell.border)
        itextCell.setPadding(cell.padding.toFloat())

        val renderedContent = render(cell.content.innerElement, cb, fontIndex)

        if (renderedContent is Phrase) {
            if (renderedContent is com.itextpdf.text.Paragraph) {
                itextCell.setLeading(0f, renderedContent.multipliedLeading)
            }

            itextCell.isUseAscender = true
            itextCell.isUseDescender = true

            itextCell.phrase = renderedContent
        } else {
            itextCell.addElement(renderedContent)
        }

        itextCell.setLineType(cell.stroke)

        return itextCell
    }

    private fun PdfPCell.setLineType(stroke: Drawing.Stroke) {
        fun PdfPCell.setCellBorderEvent(fn: PdfContentByte.() -> Unit) {
            setCellEvent { cell, position, canvases ->
                val canvas = canvases[PdfPTable.LINECANVAS]
                canvas.fn()
                position.cloneNonPositionParameters(cell)
                canvas.rectangle(position)
                canvas.stroke()
            }
        }

        if (stroke == Drawing.Stroke.DASHED) setCellBorderEvent { setLineDash(3f, 3f) } else
            if (stroke == Drawing.Stroke.DOTTED) setCellBorderEvent { setLineDash(2f) }
    }

    private fun renderParagraph(paragraph: Paragraph, fontIndex: Map<String, BaseFont>): com.itextpdf.text.Paragraph {
        val itextParagraph = com.itextpdf.text.Paragraph()
        itextParagraph.multipliedLeading = paragraph.leading
        itextParagraph.spacingBefore

        for (line in paragraph.lines) {
            val renderedLine = renderText(line, fontIndex)

            itextParagraph.add(renderedLine)
            itextParagraph.add("\n")
        }

        return itextParagraph
    }

    private fun renderText(text: Text, fontIndex: Map<String, BaseFont>): Phrase {
        val itextChunk = Chunk(text.content)

        val convertedBackground = text.background?.let { convertColor(it) }
        itextChunk.setBackground(convertedBackground)

        fontIndex[text.fontName]?.let { itextChunk.font = com.itextpdf.text.Font(it) }

        itextChunk.font.size = text.fontSize
        itextChunk.font.style = convertFontStyle(text.fontWeight)

        return Phrase(itextChunk)
    }

    private val renderingCache = mutableMapOf<String, MutableMap<Pair<Int, Int>, PdfTemplate>>()

    private fun renderImage(image: SvgImage, cb: PdfContentByte): Image {
        val pdfTemplate = renderingCache.getOrPut(image.toString()) { mutableMapOf() }
            .getOrPut(image.size.width to image.size.height) { cb.renderSvgToPdf(image.svg, image.size) }

        return Image.getInstance(pdfTemplate)
    }

    private fun PdfContentByte.renderSvgToPdf(svg: Svg, dim: Dimension): PdfTemplate {
        val tp = createTemplate(dim.width.toFloat(), dim.height.toFloat())
        val g2 = PdfGraphics2D(tp, tp.width, tp.height, DefaultFontMapper())

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
}
