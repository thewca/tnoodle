package org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model

import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.properties.Font

class Paragraph(
    val leading: Float = Font.Leading.DEFAULT,
    val lines: List<Text>
) : ContainerElement<Text>(lines), CellElement {
    override val innerElement: Element
        get() = this
}
