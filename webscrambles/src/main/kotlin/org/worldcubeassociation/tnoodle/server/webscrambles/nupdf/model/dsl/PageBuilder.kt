package org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.dsl

import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.Element
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.Page
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.properties.Drawing
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.properties.Paper

class PageBuilder(parent: ElementBuilder?) : ElementBuilder(parent) {
    private val elements = mutableListOf<Element>()

    var size: Paper.Size = Paper.Size.DEFAULT

    var marginTop: Int = Drawing.Margin.DEFAULT_VERTICAL
    var marginBottom: Int = Drawing.Margin.DEFAULT_VERTICAL
    var marginLeft: Int = Drawing.Margin.DEFAULT_HORIZONTAL
    var marginRight: Int = Drawing.Margin.DEFAULT_HORIZONTAL

    fun setHorizontalMargins(margin: Int) {
        marginLeft = margin
        marginRight = margin
    }

    fun setVerticalMargins(margin: Int) {
        marginTop = margin
        marginBottom = margin
    }

    fun setMargins(margin: Int) {
        setHorizontalMargins(margin)
        setVerticalMargins(margin)
    }

    fun table(numColumns: Int, fn: TableBuilder.() -> Unit) {
        val table = TableBuilder(numColumns, this).apply(fn).compile()
        elements.add(table)
    }

    fun compile(): Page {
        return Page(size, marginTop, marginBottom, marginLeft, marginRight, elements)
    }
}
