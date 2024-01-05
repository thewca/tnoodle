package org.worldcubeassociation.tnoodle.server.pdf.model

import org.worldcubeassociation.tnoodle.svglite.Dimension
import org.worldcubeassociation.tnoodle.svglite.Svg

data class SvgImage(val svg: Svg, val size: Dimension) : Element(), CellElement {
    override val innerElement: Element
        get() = this
}
