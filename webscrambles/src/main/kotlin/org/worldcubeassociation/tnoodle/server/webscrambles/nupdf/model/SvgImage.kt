package org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model

import org.worldcubeassociation.tnoodle.svglite.Dimension
import org.worldcubeassociation.tnoodle.svglite.Svg

class SvgImage(val svg: Svg, val size: Dimension) : Element(), CellElement {
    override val innerElement: Element
        get() = this
}
