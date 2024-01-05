package org.worldcubeassociation.tnoodle.server.pdf.model.dsl

import org.worldcubeassociation.tnoodle.server.pdf.model.Paragraph
import org.worldcubeassociation.tnoodle.server.pdf.model.Text

class ParagraphBuilder(parent: ElementBuilder?) : PropertiesElementBuilder(parent) {
    private val lines = mutableListOf<Text>()

    fun line(content: String, fn: TextBuilder.() -> Unit = {}) {
        val text = TextBuilder(content, this).apply(fn).compile()
        lines.add(text)
    }

    fun optimalLine(content: String, height: Float, width: Float, unitToInches: Float = 1f, fn: TextBuilder.() -> Unit = {}) {
        return line(content) {
            fn()
            setOptimalOneLineFontSize(height, width, unitToInches)
        }
    }

    fun compile(): Paragraph {
        return Paragraph(leading, lines)
    }
}
