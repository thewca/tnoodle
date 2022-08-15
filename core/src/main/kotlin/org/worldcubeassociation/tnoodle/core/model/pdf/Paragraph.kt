package org.worldcubeassociation.tnoodle.core.model.pdf

import org.worldcubeassociation.tnoodle.core.model.pdf.properties.Font

data class Paragraph(
    val leading: Float = Font.Leading.DEFAULT,
    val lines: List<Text>
) : ContainerElement<Text>(lines), CellElement {
    override val innerElement: Element
        get() = this
}
