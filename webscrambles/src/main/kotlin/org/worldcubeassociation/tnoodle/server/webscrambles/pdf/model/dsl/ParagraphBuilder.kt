package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.dsl

import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.Paragraph
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.Text

class ParagraphBuilder(parent: ElementBuilder?) : PropertiesElementBuilder(parent) {
    private val lines = mutableListOf<Text>()

    fun line(content: String, fn: TextBuilder.() -> Unit = {}) {
        val text = TextBuilder(content, this).apply(fn).compile()
        lines.add(text)
    }

    fun compile(): Paragraph {
        return Paragraph(leading, lines)
    }
}
