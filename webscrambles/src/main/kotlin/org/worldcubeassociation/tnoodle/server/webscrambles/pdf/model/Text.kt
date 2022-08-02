package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model

import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Font
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.RgbColor

data class Text(
    val content: String,
    override val fontName: String? = Font.DEFAULT,
    override val fontSize: Float = Font.Size.DEFAULT,
    override val fontWeight: Font.Weight = Font.Weight.DEFAULT,
    val background: RgbColor? = RgbColor.DEFAULT
) : Element(), CellElement, FontableElement {
    override val innerElement: Element
        get() = this
}
