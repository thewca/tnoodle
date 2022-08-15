package org.worldcubeassociation.tnoodle.core.model.pdf

data class SvgImage(val svg: String, val width: Float, val height: Float) : Element(), CellElement {
    override val innerElement: Element
        get() = this
}
