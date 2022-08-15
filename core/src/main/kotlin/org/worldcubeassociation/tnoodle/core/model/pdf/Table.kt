package org.worldcubeassociation.tnoodle.core.model.pdf

data class Table(
    val relativeColWidths: List<Float>,
    val rows: List<Row>
) : ContainerElement<Row>(rows), CellElement {
    override val innerElement: Element
        get() = this

    companion object {
        fun unitWidths(numColumns: Int): List<Float> = List(numColumns) { 1f }
    }
}
