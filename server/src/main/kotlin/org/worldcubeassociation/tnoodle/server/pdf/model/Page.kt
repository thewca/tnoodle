package org.worldcubeassociation.tnoodle.server.pdf.model

import org.worldcubeassociation.tnoodle.server.pdf.model.properties.Drawing
import org.worldcubeassociation.tnoodle.server.pdf.model.properties.Paper

data class Page(
    val size: Paper.Size = Paper.Size.DEFAULT,
    val marginTop: Int = Drawing.Margin.DEFAULT_VERTICAL,
    val marginBottom: Int = Drawing.Margin.DEFAULT_VERTICAL,
    val marginLeft: Int = Drawing.Margin.DEFAULT_HORIZONTAL,
    val marginRight: Int = Drawing.Margin.DEFAULT_HORIZONTAL,
    val headerLines: Pair<String, String>? = null,
    val footerLine: String? = null,
    val canvas: List<TurtleCommand> = emptyList(),
    val elements: List<Element>
) : ContainerElement<Element>(elements)
