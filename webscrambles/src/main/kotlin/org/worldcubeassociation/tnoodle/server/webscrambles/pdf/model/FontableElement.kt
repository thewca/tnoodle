package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model

import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Font

sealed interface FontableElement {
    val fontName: String?
    val fontSize: Float
    val fontWeight: Font.Weight
}
