package org.worldcubeassociation.tnoodle.server.pdf.model.dsl

import org.worldcubeassociation.tnoodle.server.pdf.model.Text
import org.worldcubeassociation.tnoodle.server.pdf.model.properties.RgbColor
import org.worldcubeassociation.tnoodle.server.pdf.util.FontUtil

class TextBuilder(val content: String, parent: ElementBuilder?) : PropertiesElementBuilder(parent) {
    var background: RgbColor? = RgbColor.DEFAULT

    fun setOptimalOneLineFontSize(height: Float, width: Float, unitToInches: Float = 1f) {
        fontSize = FontUtil.computeOneLineFontSize(content, height, width, fontName.orEmpty(), unitToInches, leading)
    }

    fun compile(): Text {
        return Text(content, fontName, fontSize, fontWeight, background)
    }
}
