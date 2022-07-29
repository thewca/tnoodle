package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.dsl

import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.Text
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.RgbColor
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.FontUtil

class TextBuilder(val content: String, parent: ElementBuilder?) : PropertiesElementBuilder(parent) {
    var background: RgbColor? = RgbColor.DEFAULT

    fun setOptimalOneLineFontSize(width: Float, unitToInches: Float = 1f) {
        fontSize = FontUtil.computeOptimalOneLineFontSize(content, width, fontName.orEmpty(), unitToInches)
    }

    fun setOptimalOneLineFontSize(height: Float, width: Float, unitToInches: Float = 1f) {
        fontSize = FontUtil.computeOptimalOneLineFontSize(content, height, width, fontName.orEmpty(), unitToInches)
    }

    fun compile(): Text {
        return Text(content, fontName, fontSize, fontWeight, background)
    }
}
