package org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.dsl

import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.Text
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.properties.RgbColor
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.util.FontUtil

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
