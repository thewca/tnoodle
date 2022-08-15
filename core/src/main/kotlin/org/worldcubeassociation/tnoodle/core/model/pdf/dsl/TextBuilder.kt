package org.worldcubeassociation.tnoodle.core.model.pdf.dsl

import org.worldcubeassociation.tnoodle.core.model.pdf.Text
import org.worldcubeassociation.tnoodle.core.model.pdf.properties.RgbColor

class TextBuilder(val content: String, parent: ElementBuilder?) : PropertiesElementBuilder(parent) {
    var background: RgbColor? = RgbColor.DEFAULT

    fun compile(): Text {
        return Text(content, fontName, fontSize, fontWeight, background)
    }
}
