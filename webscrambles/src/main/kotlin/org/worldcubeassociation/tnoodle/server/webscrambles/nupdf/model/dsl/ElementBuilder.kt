package org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.dsl

import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.properties.Alignment
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.properties.Drawing
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.properties.Font

sealed class ElementBuilder(val parent: ElementBuilder?) {
    fun findParentProperties(): PropertiesElementBuilder? {
        if (parent is PropertiesElementBuilder)
            return parent

        return parent?.findParentProperties()
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
