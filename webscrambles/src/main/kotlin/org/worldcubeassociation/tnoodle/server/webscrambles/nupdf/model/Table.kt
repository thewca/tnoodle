package org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model

class Table(
    val relativeColWidths: List<Float>,
    val rows: List<Row>
) : ContainerElement<Row>(rows), CellElement {
    override val innerElement: Element
        get() = this

    companion object {
        fun unitWidths(numColumns: Int): List<Float> = List(numColumns) { 1f }
    }
}
