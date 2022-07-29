package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model

import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Drawing
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Paper

class Page(
    val size: Paper.Size = Paper.Size.DEFAULT,
    val marginTop: Int = Drawing.Margin.DEFAULT_VERTICAL,
    val marginBottom: Int = Drawing.Margin.DEFAULT_VERTICAL,
    val marginLeft: Int = Drawing.Margin.DEFAULT_HORIZONTAL,
    val marginRight: Int = Drawing.Margin.DEFAULT_HORIZONTAL,
    val headerLines: Pair<String, String>? = null,
    val footerLine: String? = null,
    val elements: List<Element>
) : ContainerElement<Element>(elements)
