package org.worldcubeassociation.tnoodle.core.model.pdf

import org.worldcubeassociation.tnoodle.core.model.pdf.properties.Font
import org.worldcubeassociation.tnoodle.core.model.pdf.properties.RgbColor

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
