package org.worldcubeassociation.tnoodle.server.pdf.model

import org.worldcubeassociation.tnoodle.server.pdf.model.properties.Font

data class Paragraph(
    val leading: Float = Font.Leading.DEFAULT,
    val lines: List<Text>
) : ContainerElement<Text>(lines), CellElement {
    override val innerElement: Element
        get() = this
}
