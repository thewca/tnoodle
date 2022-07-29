package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.engine

import com.itextpdf.io.font.PdfEncodings
import com.itextpdf.kernel.colors.Color
import com.itextpdf.kernel.colors.DeviceRgb
import com.itextpdf.kernel.font.PdfFont
import com.itextpdf.kernel.font.PdfFontFactory
import com.itextpdf.kernel.geom.PageSize
import com.itextpdf.kernel.pdf.PdfDocument
import com.itextpdf.kernel.pdf.PdfWriter
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
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.*
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.Document
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.Element
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.Paragraph
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.*
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Font
import java.io.ByteArrayOutputStream

object IText7Engine {
    fun render(doc: Document): ByteArray {
        val baos = ByteArrayOutputStream()
        val writer = PdfWriter(baos)

        val pdfDocument = PdfDocument(writer)
        val modelDocument = com.itextpdf.layout.Document(pdfDocument)

        val fontIndex = doc.exposeFontNames()
            .associateWith { PdfFontFactory.createFont("fonts/$it.ttf", PdfEncodings.IDENTITY_H, pdfDocument) }

        pdfDocument.documentInfo.addCreationDate()
        pdfDocument.documentInfo.producer = "iText 7" // TODO is there a cleaner alternative?
        pdfDocument.documentInfo.title = doc.title

        for (page in doc.pages) {
            pdfDocument.defaultPageSize = convertPageSize(page.size)

            modelDocument.setMargins(
                page.marginTop.toFloat(),
                page.marginRight.toFloat(),
                page.marginBottom.toFloat(),
                page.marginLeft.toFloat()
            )

            pdfDocument.addNewPage()

            for (element in page.elements) {
                val itextElement = render(element, pdfDocument, fontIndex)

                if (itextElement is IBlockElement) {
                    modelDocument.add(itextElement)
                } else if (itextElement is Image) {
                    modelDocument.add(itextElement)
                }
            }
        }

        modelDocument.close()

        val rendered = baos.toByteArray()
        // FIXME remove this massive hack of laziness
        return IText5Engine.postProcessing(doc, rendered)
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
        if (style == Font.Weight.BOLD) setBold()
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
        itextTable.isKeepTogether = true

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
        //itextCell.setPaddingTop(-0.5f) // TODO HACK

        val renderedContent = render(cell.content.innerElement, pdfDocument, fontIndex)

        if (renderedContent is IBlockElement) {
            itextCell.add(renderedContent)
        } else if (renderedContent is Image) {
            renderedContent.setPadding(cell.padding.toFloat())
            renderedContent.setHorizontalAlignment(convertAlignment(cell.horizontalAlignment))

            itextCell.add(renderedContent)
        } else if (renderedContent is com.itextpdf.layout.element.Text) {
            val nestedParagraph = com.itextpdf.layout.element.Paragraph(renderedContent)
                .setMultipliedLeading(1f)
            //.setPaddingTop(-2f) // TODO hack!

            itextCell.add(nestedParagraph)
        }

        return itextCell
    }

    private fun renderParagraph(
        paragraph: Paragraph,
        fontIndex: Map<String, PdfFont>
    ): com.itextpdf.layout.element.Paragraph {
        val itextParagraph = com.itextpdf.layout.element.Paragraph()
        itextParagraph.setMultipliedLeading(paragraph.leading * 0.6f) // TODO HACK

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
            .setAutoScale(true)
    }
}
