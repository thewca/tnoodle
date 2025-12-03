package org.worldcubeassociation.tnoodle.server.pdf.engine

import com.itextpdf.io.font.PdfEncodings
import com.itextpdf.kernel.colors.Color
import com.itextpdf.kernel.colors.DeviceRgb
import com.itextpdf.kernel.font.PdfFont
import com.itextpdf.kernel.font.PdfFontFactory
import com.itextpdf.kernel.geom.PageSize
import com.itextpdf.kernel.pdf.*
import com.itextpdf.kernel.pdf.action.PdfAction
import com.itextpdf.kernel.pdf.canvas.PdfCanvas
import com.itextpdf.kernel.pdf.extgstate.PdfExtGState
import com.itextpdf.kernel.pdf.navigation.PdfExplicitDestination
import com.itextpdf.kernel.utils.PdfMerger
import com.itextpdf.layout.Canvas
import com.itextpdf.layout.borders.Border
import com.itextpdf.layout.borders.DashedBorder
import com.itextpdf.layout.borders.DottedBorder
import com.itextpdf.layout.borders.SolidBorder
import com.itextpdf.layout.element.IBlockElement
import com.itextpdf.layout.element.IElement
import com.itextpdf.layout.element.Image
import com.itextpdf.layout.properties.HorizontalAlignment
import com.itextpdf.layout.properties.TextAlignment
import com.itextpdf.layout.properties.VerticalAlignment
import com.itextpdf.svg.converter.SvgConverter
import org.worldcubeassociation.tnoodle.server.pdf.model.*
import org.worldcubeassociation.tnoodle.server.pdf.model.properties.*
import java.io.ByteArrayOutputStream
import java.time.LocalDate
import kotlin.math.atan

object IText7Engine {
    const val CREATOR_STRING = "iText 7" // TODO is there a cleaner alternative?

    fun render(doc: Document, password: String? = null): ByteArray {
        val baos = ByteArrayOutputStream()
        val creationDate = LocalDate.now() // TODO pass in from the outside world?
        val properties = WriterProperties()

        if (password != null) {
            properties.setStandardEncryption(
                password.toByteArray(),
                password.toByteArray(),
                EncryptionConstants.ALLOW_PRINTING,
                EncryptionConstants.STANDARD_ENCRYPTION_128
            )
        }

        val writer = PdfWriter(baos, properties)

        val pdfDocument = PdfDocument(writer)
        val itextDocument = com.itextpdf.layout.Document(pdfDocument)

        val fontIndex = doc.exposeFontNames()
            .associateWith { PdfFontFactory.createFont("fonts/$it.ttf", PdfEncodings.IDENTITY_H, pdfDocument) }

        pdfDocument.documentInfo.addCreationDate()
        pdfDocument.documentInfo.producer = CREATOR_STRING
        pdfDocument.documentInfo.title = doc.title

        for ((n, page) in doc.pages.withIndex()) {
            val itextPageSize = convertPageSize(page.size)
            pdfDocument.defaultPageSize = itextPageSize

            itextDocument.setMargins(
                page.marginTop.toFloat(),
                page.marginRight.toFloat(),
                page.marginBottom.toFloat(),
                page.marginLeft.toFloat()
            )

            val addedPage = pdfDocument.addNewPage()

            if (doc.watermark != null) {
                val monoFont = PdfFontFactory.createFont("fonts/${Font.MONO}.ttf", PdfEncodings.IDENTITY_H, pdfDocument)
                addedPage.addWatermark(doc.watermark, monoFont, n + 1)
            }

            val headerHeight = 3 * page.marginTop.toFloat() / 4
            val footerHeight = 3 * page.marginBottom.toFloat() / 4

            if (doc.showHeaderTimestamp)
                addedPage.showHeaderLeft(creationDate.toString(), itextPageSize, headerHeight, page.marginLeft.toFloat())

            if (page.headerLines != null)
                addedPage.showHeaderCenter(page.headerLines.first, page.headerLines.second, itextPageSize, headerHeight)

            if (doc.showPageNumbers)
                addedPage.showHeaderRight("${n + 1}/${doc.pages.size}", itextPageSize, headerHeight, page.marginRight.toFloat())

            if (page.footerLine != null)
                addedPage.showFooterCenter(page.footerLine, itextPageSize, footerHeight)

            if (page.canvas.isNotEmpty()) {
                val turtleCanvas = PdfCanvas(addedPage)
                    .saveState()

                for (command in page.canvas) {
                    turtleCanvas.executeCommand(command)
                }

                turtleCanvas.restoreState()
            }

            for (element in page.elements) {
                val itextElement = render(element, pdfDocument, fontIndex)

                if (itextElement is IBlockElement) {
                    itextDocument.add(itextElement)
                } else if (itextElement is Image) {
                    itextDocument.add(itextElement)
                }
            }
        }

        itextDocument.close()

        return baos.toByteArray()
    }

    private fun PdfPage.showHeaderLeft(text: String, pageSize: PageSize, headerHeight: Float, marginLeft: Float) {
        writeTextOutOfBounds(text, 2 * marginLeft, pageSize.height - headerHeight)
    }

    private fun PdfPage.showHeaderRight(text: String, pageSize: PageSize, headerHeight: Float, marginRight: Float) {
        writeTextOutOfBounds(text, pageSize.width - 2 * marginRight, pageSize.height - headerHeight)
    }

    private fun PdfPage.showHeaderCenter(lineOne: String, lineTwo: String, pageSize: PageSize, headerHeight: Float) {
        writeTextOutOfBounds(lineOne, pageSize.width / 2, pageSize.top - 2 * headerHeight / 3)
        writeTextOutOfBounds(lineTwo, pageSize.width / 2, pageSize.top - headerHeight)
    }

    private fun PdfPage.showFooterCenter(line: String, pageSize: PageSize, footerHeight: Float) {
        writeTextOutOfBounds(line, pageSize.width / 2, pageSize.bottom + footerHeight)
    }

    private fun PdfPage.writeTextOutOfBounds(text: String, horizontalPos: Float, verticalPos: Float) {
        val over = PdfCanvas(newContentStreamBefore(), resources, document)

        Canvas(over, pageSize)
            .showTextAligned(
                text,
                horizontalPos,
                verticalPos,
                TextAlignment.CENTER,
                VerticalAlignment.MIDDLE,
                0f
            )
    }

    private fun PdfPage.addWatermark(watermark: String, font: PdfFont, pageNumber: Int) {
        val under = PdfCanvas(newContentStreamBefore(), resources, document)

        val transparentGraphicsState = PdfExtGState()
            .setFillOpacity(0.2f)

        under.saveState()
        under.setExtGState(transparentGraphicsState)

        val paragraph = com.itextpdf.layout.element.Paragraph(watermark)
            .setFont(font)
            .setFontSize(72f) // TODO magic number

        val diagRotation = atan(pageSize.height / pageSize.width)

        val canvasWatermark = Canvas(under, pageSize)
            .showTextAligned(
                paragraph,
                (pageSize.left + pageSize.right) / 2,
                (pageSize.top + pageSize.bottom) / 2,
                pageNumber,
                TextAlignment.CENTER,
                VerticalAlignment.MIDDLE,
                diagRotation
            )

        under.restoreState()
        canvasWatermark.close()
    }

    private fun convertPageSize(size: Paper.Size): PageSize {
        return when (size) {
            Paper.Size.A4 -> PageSize.A4
        }
    }

    private fun convertColor(color: RgbColor): Color {
        return DeviceRgb(color.r, color.g, color.b)
    }

    private fun convertAlignment(align: Alignment.Horizontal): HorizontalAlignment {
        return when (align) {
            Alignment.Horizontal.LEFT -> HorizontalAlignment.LEFT
            Alignment.Horizontal.CENTER -> HorizontalAlignment.CENTER
            Alignment.Horizontal.RIGHT -> HorizontalAlignment.RIGHT
            Alignment.Horizontal.JUSTIFIED -> HorizontalAlignment.CENTER // TODO
        }
    }

    private fun convertAlignment(align: Alignment.Vertical): VerticalAlignment {
        return when (align) {
            Alignment.Vertical.TOP -> VerticalAlignment.TOP
            Alignment.Vertical.MIDDLE -> VerticalAlignment.MIDDLE
            Alignment.Vertical.BOTTOM -> VerticalAlignment.BOTTOM
        }
    }

    private fun convertTextAlignment(align: Alignment.Horizontal): TextAlignment {
        return when (align) {
            Alignment.Horizontal.LEFT -> TextAlignment.LEFT
            Alignment.Horizontal.CENTER -> TextAlignment.CENTER
            Alignment.Horizontal.RIGHT -> TextAlignment.RIGHT
            Alignment.Horizontal.JUSTIFIED -> TextAlignment.JUSTIFIED
        }
    }

    private fun convertBorder(border: Drawing.Stroke): Border {
        return when (border) {
            Drawing.Stroke.THROUGH -> SolidBorder(0.5f)
            Drawing.Stroke.DASHED -> DashedBorder(0.5f)
            Drawing.Stroke.DOTTED -> DottedBorder(0.5f)
        }
    }

    private fun com.itextpdf.layout.element.Text.setFontStyle(style: Font.Weight) {
        if (style == Font.Weight.BOLD) simulateBold()
    }

    private fun PdfCanvas.executeCommand(turtleCmd: TurtleCommand) {
        when (turtleCmd) {
            is TurtleCommand.MoveTo -> moveTo(turtleCmd.x.toDouble(), turtleCmd.y.toDouble())
            is TurtleCommand.LineTo -> lineTo(turtleCmd.x.toDouble(), turtleCmd.y.toDouble())
            is TurtleCommand.SetLineWidth -> setLineWidth(turtleCmd.width)
            is TurtleCommand.SetStrokeColor -> setStrokeColor(convertColor(turtleCmd.color))
            is TurtleCommand.Stroke -> stroke()
        }
    }

    private fun render(element: Element, pdfDocument: PdfDocument, fontIndex: Map<String, PdfFont>): IElement {
        return when (element) {
            is Table -> renderTable(element, pdfDocument, fontIndex)
            is Paragraph -> renderParagraph(element, fontIndex)
            is Text -> renderText(element, fontIndex)
            is SvgImage -> renderImage(element, pdfDocument)
            is Cell<*> -> renderCell(element, pdfDocument, fontIndex)
            else -> render(Text("Unsupported element $element"), pdfDocument, fontIndex)
        }
    }

    private fun renderTable(
        table: Table,
        pdfDocument: PdfDocument,
        fontIndex: Map<String, PdfFont>
    ): com.itextpdf.layout.element.Table {
        val itextTable = com.itextpdf.layout.element.Table(table.relativeColWidths.toFloatArray())
        itextTable.setFixedLayout()
        itextTable.useAllAvailableWidth()
        // FIXME temporarily disabled because this can run into an infinite loop in iText layout
        //itextTable.isKeepTogether = true

        for (row in table.rows) {
            for (cell in row.cells) {
                val renderedCell = renderCell(cell, pdfDocument, fontIndex)
                itextTable.addCell(renderedCell)
            }
        }

        return itextTable
    }

    private fun com.itextpdf.layout.element.Cell.setBorderAround(border: Border, borderType: Drawing.Border) {
        setBorder(Border.NO_BORDER)
        if (borderType == Drawing.Border.FULL || borderType == Drawing.Border.ROWS_ONLY) setBorderTop(border)
        if (borderType == Drawing.Border.FULL || borderType == Drawing.Border.COLS_ONLY) setBorderRight(border)
        if (borderType == Drawing.Border.FULL || borderType == Drawing.Border.ROWS_ONLY) setBorderBottom(border)
        if (borderType == Drawing.Border.FULL || borderType == Drawing.Border.COLS_ONLY) setBorderLeft(border)
    }

    private fun <T : CellElement> renderCell(
        cell: Cell<T>,
        pdfDocument: PdfDocument,
        fontIndex: Map<String, PdfFont>
    ): com.itextpdf.layout.element.Cell {
        val itextCell = com.itextpdf.layout.element.Cell(cell.rowSpan, cell.colSpan)
        cell.background?.let { itextCell.setBackgroundColor(convertColor(it), it.a) }
        itextCell.setVerticalAlignment(convertAlignment(cell.verticalAlignment))
        itextCell.setHorizontalAlignment(convertAlignment(cell.horizontalAlignment))
        val borderType = convertBorder(cell.stroke)
        itextCell.setBorderAround(borderType, cell.border)
        itextCell.setPadding(cell.padding.toFloat())
        itextCell.setTextAlignment(convertTextAlignment(cell.horizontalAlignment))
        cell.minHeight?.let { itextCell.setMinHeight(it) }

        val innerElement = cell.content.innerElement

        val renderedContent = if (innerElement is Text) {
            val mockParagraph = Paragraph(1f, listOf(innerElement))
            render(mockParagraph, pdfDocument, fontIndex)
        } else render(cell.content.innerElement, pdfDocument, fontIndex)

        if (renderedContent is IBlockElement) {
            itextCell.add(renderedContent)
        } else if (renderedContent is Image) {
            renderedContent.setPadding(cell.padding.toFloat())
            renderedContent.setHorizontalAlignment(convertAlignment(cell.horizontalAlignment))

            itextCell.add(renderedContent)
        }

        return itextCell
    }

    private fun hackLeading(fontSize: Float, desiredLeading: Float): Float {
        if (fontSize > 12)
            return desiredLeading

        val hackLeading = -0.000441919f * fontSize * fontSize * fontSize +
            0.00727814f * fontSize * fontSize +
            0.0515296f * fontSize +
            0.0454113f

        return hackLeading.coerceAtMost(1f) * desiredLeading
    }

    private fun renderParagraph(
        paragraph: Paragraph,
        fontIndex: Map<String, PdfFont>
    ): com.itextpdf.layout.element.Paragraph {
        val itextParagraph = com.itextpdf.layout.element.Paragraph()
        val minFontSize = paragraph.lines.minOf { it.fontSize }
        itextParagraph.setMultipliedLeading(hackLeading(minFontSize, paragraph.leading))

        for (line in paragraph.lines) {
            val renderedLine = renderText(line, fontIndex)

            itextParagraph.add(renderedLine)
            itextParagraph.add("\n")
        }

        return itextParagraph
    }

    private fun renderText(text: Text, fontIndex: Map<String, PdfFont>): com.itextpdf.layout.element.Text {
        val itextText = com.itextpdf.layout.element.Text(text.content)

        text.background?.let { itextText.setBackgroundColor(convertColor(it), it.a) }

        fontIndex[text.fontName]?.let { itextText.setFont(it) }

        itextText.setFontSize(text.fontSize)
        itextText.setFontStyle(text.fontWeight)

        return itextText
    }

    private fun renderImage(image: SvgImage, pdfDocument: PdfDocument): Image {
        return SvgConverter.convertToImage(image.svg.toString().byteInputStream(), pdfDocument)
            //.setAutoScale(true)
            .setMaxHeight(image.size.height.toFloat())
            .setHeight(image.size.height.toFloat())
            .setMaxWidth(image.size.width.toFloat())
            .setWidth(image.size.width.toFloat())
    }

    fun renderWithOutline(documents: List<Document>, password: String? = null): ByteArray {
        val baos = ByteArrayOutputStream()
        val properties = WriterProperties()

        if (password != null) {
            properties.setStandardEncryption(
                password.toByteArray(),
                password.toByteArray(),
                EncryptionConstants.ALLOW_PRINTING,
                EncryptionConstants.STANDARD_ENCRYPTION_128
            )
        }

        val writer = PdfWriter(baos, properties)
        val pdfDocument = PdfDocument(writer)

        pdfDocument.documentInfo.addCreationDate()
        pdfDocument.documentInfo.producer = CREATOR_STRING

        val root = pdfDocument.getOutlines(false)

        val outlineGroupCache = mutableMapOf<String, PdfOutline>()

        tailrec fun traverseOutline(
            group: List<String>,
            action: PdfAction,
            current: PdfOutline,
            index: Int = 0
        ): PdfOutline {
            if (index >= group.size)
                return current

            val subGroup = group.subList(0, index + 1).joinToString("")
            val nextOutline = outlineGroupCache.getOrPut(subGroup) {
                current.addOutline(group[index])
            }

            return traverseOutline(group, action, nextOutline, index + 1)
        }

        for (document in documents) {
            val pdfMerger = PdfMerger(pdfDocument)
                .setCloseSourceDocuments(true)

            val renderedBytesIn = render(document).inputStream()
            val sourcePdf = PdfDocument(PdfReader(renderedBytesIn))
            val sourcePdfPages = sourcePdf.numberOfPages

            pdfMerger.merge(sourcePdf, 1, sourcePdfPages)

            if (!document.isShadowCopy) {
                val currentPageNum = pdfDocument.numberOfPages - sourcePdfPages + 1
                val targetPage = pdfDocument.getPage(currentPageNum)

                val action = PdfAction.createGoTo(PdfExplicitDestination.createFit(targetPage))

                traverseOutline(document.outlineGroup, action, root)
                    .addOutline(document.title)
                    .addAction(action)
            }
        }

        pdfDocument.close()
        return baos.toByteArray()
    }
}
