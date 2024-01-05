package org.worldcubeassociation.tnoodle.server.pdf.model.dsl

import org.worldcubeassociation.tnoodle.server.pdf.model.SvgImage
import org.worldcubeassociation.tnoodle.svglite.Dimension
import org.worldcubeassociation.tnoodle.svglite.Svg

class SvgBuilder(parent: ElementBuilder?) : ElementBuilder(parent) {
    var size: Dimension? = null

    // TODO don't depend on svglite here!
    fun compile(content: Svg): SvgImage {
        // TODO subtract padding?
        val actualSize = size ?: content.size
        return SvgImage(content, actualSize)
    }
}
