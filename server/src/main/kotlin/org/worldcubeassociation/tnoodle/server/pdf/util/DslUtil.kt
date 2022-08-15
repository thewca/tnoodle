package org.worldcubeassociation.tnoodle.server.pdf.util

import org.worldcubeassociation.tnoodle.core.model.pdf.Text
import org.worldcubeassociation.tnoodle.core.model.pdf.dsl.CellBuilder
import org.worldcubeassociation.tnoodle.core.model.pdf.dsl.ParagraphBuilder
import org.worldcubeassociation.tnoodle.core.model.pdf.dsl.TextBuilder

object DslUtil {
    fun TextBuilder.setOptimalOneLineFontSize(height: Float, width: Float, unitToInches: Float = 1f) {
        fontSize = FontUtil.computeOneLineFontSize(content, height, width, fontName.orEmpty(), unitToInches, leading)
    }

    fun ParagraphBuilder.optimalLine(content: String, height: Float, width: Float, unitToInches: Float = 1f, fn: TextBuilder.() -> Unit = {}) {
        return line(content) {
            fn()
            setOptimalOneLineFontSize(height, width, unitToInches)
        }
    }

    fun CellBuilder.optimalText(content: String, height: Float, width: Float, unitToInches: Float = 1f, fn: TextBuilder.() -> Unit = {}): Text {
        return text(content) {
            fn()
            setOptimalOneLineFontSize(height, width, unitToInches)
        }
    }
}
