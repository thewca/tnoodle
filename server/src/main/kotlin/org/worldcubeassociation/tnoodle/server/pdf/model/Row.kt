package org.worldcubeassociation.tnoodle.server.pdf.model

data class Row(val cells: List<Cell<CellElement>>) : ContainerElement<Cell<CellElement>>(cells)
