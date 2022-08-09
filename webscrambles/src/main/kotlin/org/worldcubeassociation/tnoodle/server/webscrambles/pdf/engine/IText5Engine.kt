package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.engine

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
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.*
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.Document
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.Element
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.Paragraph
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.*
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Font
import org.worldcubeassociation.tnoodle.svglite.Dimension
import org.worldcubeassociation.tnoodle.svglite.Svg
import java.awt.geom.AffineTransform
import java.io.ByteArrayOutputStream
import java.time.LocalDate
import kotlin.math.PI
import kotlin.math.atan
import kotlin.math.roundToInt


object IText5Engine {
    init {
        // Email agpl@itextpdf.com if you want to know what this is about =)
        CounterFactory.getInstance().counter = NoOpCounter()
    }

    fun render(doc: Document, password: String? = null): ByteArray {
        val pdfDocument = com.itextpdf.text.Document().apply {
            addCreationDate()
            addProducer()
            addTitle(doc.title)
        }

        val baos = ByteArrayOutputStream()
        val creationDate = LocalDate.now() // TODO pass in from the outside world?

        val fontIndex = doc.exposeFontNames()
            .associateWith { BaseFont.createFont("fonts/$it.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED) }

        val writer = PdfWriter.getInstance(pdfDocument, baos)

        if (password != null) {
            writer.setEncryption(
                password.toByteArray(),
                password.toByteArray(),
                PdfWriter.ALLOW_PRINTING,
                PdfWriter.STANDARD_ENCRYPTION_128
            )
        }

        for ((n, page) in doc.pages.withIndex()) {
            val itextPageSize = convertPageSize(page.size)
            pdfDocument.pageSize = itextPageSize

            pdfDocument.setMargins(
                page.marginLeft.toFloat(),
                page.marginRight.toFloat(),
                page.marginTop.toFloat(),
                page.marginBottom.toFloat()
            )

            // if we open _before_ the for-loop, stuff like setting page size and margins will have no effect :/
            pdfDocument.open()

            val cb = writer.directContent

            if (doc.watermark != null) {
                val baseFont = BaseFont.createFont("fonts/${Font.MONO}.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED)
                cb.addWatermark(doc.watermark, baseFont, itextPageSize)
            }

            for (element in page.elements) {
                val itextElement = render(element, cb, fontIndex)
                pdfDocument.add(itextElement)
            }

            val headerHeight = 3 * page.marginTop.toFloat() / 4
            val footerHeight = 3 * page.marginBottom.toFloat() / 4

            if (doc.showHeaderTimestamp)
                cb.showHeaderLeft(creationDate.toString(), itextPageSize, headerHeight, page.marginLeft.toFloat())

            if (page.headerLines != null)
                cb.showHeaderCenter(page.headerLines.first, page.headerLines.second, itextPageSize, headerHeight)

            if (doc.showPageNumbers)
                cb.showHeaderRight("${n + 1}/${doc.pages.size}", itextPageSize, headerHeight, page.marginRight.toFloat())

            if (page.footerLine != null)
                cb.showFooterCenter(page.footerLine, itextPageSize, footerHeight)

            pdfDocument.newPage()
        }

        pdfDocument.close()

        return baos.toByteArray()
    }

    private fun PdfContentByte.showHeaderLeft(text: String, pageSize: Rectangle, headerHeight: Float, marginLeft: Float) {
        writeTextOutOfBounds(text, 2 * marginLeft, pageSize.height - headerHeight)
    }

    private fun PdfContentByte.showHeaderRight(text: String, pageSize: Rectangle, headerHeight: Float, marginRight: Float) {
        writeTextOutOfBounds(text, pageSize.width - 2 * marginRight, pageSize.height - headerHeight)
    }

    private fun PdfContentByte.showHeaderCenter(lineOne: String, lineTwo: String, pageSize: Rectangle, headerHeight: Float) {
        writeTextOutOfBounds(lineOne, pageSize.width / 2, pageSize.top - 2 * headerHeight / 3)
        writeTextOutOfBounds(lineTwo, pageSize.width / 2, pageSize.top - headerHeight)
    }

    private fun PdfContentByte.showFooterCenter(line: String, pageSize: Rectangle, footerHeight: Float) {
        writeTextOutOfBounds(line, pageSize.width / 2, pageSize.bottom + footerHeight)
    }

    private fun PdfContentByte.writeTextOutOfBounds(text: String, horizontalPos: Float, verticalPos: Float) {
        ColumnText.showTextAligned(
            this,
            com.itextpdf.text.Element.ALIGN_CENTER,
            Phrase(text),
            horizontalPos,
            verticalPos,
            0f
        )
    }

    private fun PdfContentByte.addWatermark(watermark: String, font: BaseFont, pageSize: Rectangle) {
        val transparentState = PdfGState().apply {
            // TODO magic number opacity const
            setFillOpacity(0.1f)
            setStrokeOpacity(0.1f)
        }

        saveState()
        setGState(transparentState)

        val diagRotation = atan(pageSize.height / pageSize.width) * (180f / PI)

        ColumnText.showTextAligned(
            this,
            com.itextpdf.text.Element.ALIGN_CENTER,
            Phrase(
                watermark,
                // TODO magic number!
                com.itextpdf.text.Font(font, 72f, com.itextpdf.text.Font.BOLD)
            ),
            (pageSize.left + pageSize.right) / 2,
            (pageSize.top + pageSize.bottom) / 2,
            diagRotation.toFloat()
        )

        restoreState()
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

    private fun render(
        element: Element,
        cb: PdfContentByte,
        fontIndex: Map<String, BaseFont>
    ): com.itextpdf.text.Element {
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

    private fun <T : CellElement> renderCell(
        cell: Cell<T>,
        cb: PdfContentByte,
        fontIndex: Map<String, BaseFont>
    ): PdfPCell {
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

    fun renderWithOutline(documents: List<Document>, password: String? = null): ByteArray {
        val pdfDocument = com.itextpdf.text.Document().apply {
            addCreationDate()
            addProducer()
        }

        val baos = ByteArrayOutputStream()
        val writer = PdfSmartCopy(pdfDocument, baos)

        if (password != null) {
            writer.setEncryption(
                password.toByteArray(),
                password.toByteArray(),
                PdfWriter.ALLOW_PRINTING,
                PdfWriter.STANDARD_ENCRYPTION_128
            )
        }

        val root = writer.directContent.rootOutline
        val pdfDestination = PdfDestination(PdfDestination.FIT)

        val outlineGroupCache = mutableMapOf<String, PdfOutline>()

        tailrec fun traverseOutline(group: List<String>, action: PdfAction, current: PdfOutline, index: Int = 0): PdfOutline {
            if (index >= group.size)
                return current

            val subGroup = group.subList(0, index + 1).joinToString("")
            val nextOutline = outlineGroupCache.getOrPut(subGroup) {
                PdfOutline(current, action, group[index], false)
            }

            return traverseOutline(group, action, nextOutline, index + 1)
        }

        for (document in documents) {
            val action = PdfAction.gotoLocalPage(writer.currentPageNumber, pdfDestination, writer)

            if (!document.isShadowCopy) {
                val rootOutline = traverseOutline(document.outlineGroup, action, root)

                // Yes, invoking the constructor is enough to *add* the outline to the document.
                // We should REALLY get rid of itext5.
                PdfOutline(rootOutline, action, document.title)
            }

            val pdfReader = PdfReader(render(document))

            // yes. itext5 is 1-based. We should REALLY get rid of itext5
            for (pageN in 1..pdfReader.numberOfPages) {
                val page = writer.getImportedPage(pdfReader, pageN)
                writer.addPage(page)
            }
        }

        pdfDocument.close()
        return baos.toByteArray()
    }
}
