package org.worldcubeassociation.tnoodle.server.pdf.model.dsl

import org.worldcubeassociation.tnoodle.server.pdf.model.properties.Alignment
import org.worldcubeassociation.tnoodle.server.pdf.model.properties.Drawing
import org.worldcubeassociation.tnoodle.server.pdf.model.properties.Font

sealed class ElementBuilder(val parent: ElementBuilder?) {
    private fun computeHierarchy(accu: List<ElementBuilder> = emptyList()): List<ElementBuilder> {
        if (parent == null)
            return accu

        return parent.computeHierarchy(accu + parent)
    }

    fun findParentProperties(): PropertiesElementBuilder? {
        return computeHierarchy()
            .filterIsInstance<PropertiesElementBuilder>()
            .firstOrNull()
    }

    private fun findPageBuilder(): PageBuilder? {
        return computeHierarchy()
            .filterIsInstance<PageBuilder>()
            .reversed()
            .firstOrNull()
    }

    fun debugCanvas(safeStroke: Boolean = true, fn: CanvasBuilder.() -> Unit) {
        findPageBuilder()?.canvas(safeStroke, fn)
    }
}

sealed class PropertiesElementBuilder(parent: ElementBuilder?) : ElementBuilder(parent) {
    // TODO property delegate
    var horizontalAlignment: Alignment.Horizontal = findParentProperties()?.horizontalAlignment ?: Alignment.Horizontal.DEFAULT
    var verticalAlignment: Alignment.Vertical = findParentProperties()?.verticalAlignment ?: Alignment.Vertical.DEFAULT

    var fontName: String? = findParentProperties()?.fontName ?: Font.DEFAULT
    var fontSize: Float = findParentProperties()?.fontSize ?: Font.Size.DEFAULT
    var fontWeight: Font.Weight = findParentProperties()?.fontWeight ?: Font.Weight.DEFAULT

    var leading: Float = findParentProperties()?.leading ?: Font.Leading.DEFAULT

    var border: Drawing.Border = findParentProperties()?.border ?: Drawing.Border.DEFAULT
    var stroke: Drawing.Stroke = findParentProperties()?.stroke ?: Drawing.Stroke.DEFAULT
}
