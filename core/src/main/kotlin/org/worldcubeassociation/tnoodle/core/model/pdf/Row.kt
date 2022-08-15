package org.worldcubeassociation.tnoodle.core.model.pdf

data class Row(val cells: List<Cell<CellElement>>) : ContainerElement<Cell<CellElement>>(cells)
