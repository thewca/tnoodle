package org.worldcubeassociation.tnoodle.core.model.pdf.dsl

import org.worldcubeassociation.tnoodle.core.model.pdf.SvgImage

class SvgBuilder(parent: ElementBuilder?) : ElementBuilder(parent) {
    // TODO subtract padding?
    fun compile(content: String, width: Float, height: Float): SvgImage {
        return SvgImage(content, width, height)
    }
}
