package org.worldcubeassociation.tnoodle.core.model.pdf

import org.worldcubeassociation.tnoodle.core.model.pdf.properties.Drawing
import org.worldcubeassociation.tnoodle.core.model.pdf.properties.Paper

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
