package org.worldcubeassociation.tnoodle.core.model.pdf.dsl

import org.worldcubeassociation.tnoodle.core.model.pdf.*
import org.worldcubeassociation.tnoodle.core.model.pdf.properties.Drawing
import org.worldcubeassociation.tnoodle.core.model.pdf.properties.RgbColor

class CellBuilder(val colSpan: Int, parent: ElementBuilder?) : PropertiesElementBuilder(parent) {
    var background: RgbColor? = RgbColor.DEFAULT

    var padding: Int = Drawing.Padding.DEFAULT

    var rowSpan: Int = 1

    fun text(content: String, fn: TextBuilder.() -> Unit = {}): Text {
        return TextBuilder(content, this).apply(fn).compile()
    }

    fun svgImage(content: String, width: Float, height: Float, fn: SvgBuilder.() -> Unit = {}): SvgImage {
        return SvgBuilder(this).apply(fn).compile(content, width, height)
    }

    fun paragraph(fn: ParagraphBuilder.() -> Unit): Paragraph {
        return ParagraphBuilder(this).apply(fn).compile()
    }

    fun evenParagraph(fn: ParagraphBuilder.() -> Unit): Paragraph {
        val renderedParagraph = paragraph(fn)
        val minFontSize = renderedParagraph.lines.minOf { it.fontSize }

        val minFontLines = renderedParagraph.lines.map {
            it.copy(fontSize = minFontSize)
        }

        return renderedParagraph.copy(lines = minFontLines)
    }

    fun table(numColumns: Int, fn: TableBuilder.() -> Unit): Table {
        return TableBuilder(numColumns, this).apply(fn).compile()
    }

    fun <T : CellElement> compile(content: T): Cell<T> {
        return Cell(content, colSpan, rowSpan, background, border, stroke, padding, horizontalAlignment, verticalAlignment)
    }
}
