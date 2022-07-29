package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model

import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Alignment
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Drawing
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.RgbColor

class Cell<out T : CellElement>(
    val content: T,
    val colSpan: Int,
    val rowSpan: Int,
    val background: RgbColor? = RgbColor.DEFAULT,
    val border: Drawing.Border = Drawing.Border.DEFAULT,
    val stroke: Drawing.Stroke = Drawing.Stroke.DEFAULT,
    val padding: Int = Drawing.Padding.DEFAULT,
    val horizontalAlignment: Alignment.Horizontal = Alignment.Horizontal.DEFAULT,
    val verticalAlignment: Alignment.Vertical = Alignment.Vertical.DEFAULT
) : ContainerElement<Element>(content.innerElement)
