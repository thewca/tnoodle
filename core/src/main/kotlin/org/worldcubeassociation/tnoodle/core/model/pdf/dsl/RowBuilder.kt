package org.worldcubeassociation.tnoodle.core.model.pdf.dsl

import org.worldcubeassociation.tnoodle.core.model.pdf.Cell
import org.worldcubeassociation.tnoodle.core.model.pdf.CellElement
import org.worldcubeassociation.tnoodle.core.model.pdf.Row

class RowBuilder(val colSpanCoefficient: Int, parent: ElementBuilder?) : PropertiesElementBuilder(parent) {
    private val cells = mutableListOf<Cell<CellElement>>()

    fun <T : CellElement> cell(colSpan: Int = 1, fn: CellBuilder.() -> T) {
        val builder = CellBuilder(colSpan * colSpanCoefficient, this)
        val content = builder.run(fn)

        val cell = builder.compile(content)
        cells.add(cell)
    }

    fun compile(): Row {
        return Row(cells)
    }
}
