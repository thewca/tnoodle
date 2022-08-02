package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model

data class Row(val cells: List<Cell<CellElement>>) : ContainerElement<Cell<CellElement>>(cells)
