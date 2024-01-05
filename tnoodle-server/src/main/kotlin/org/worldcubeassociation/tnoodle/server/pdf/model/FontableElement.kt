package org.worldcubeassociation.tnoodle.server.pdf.model

import org.worldcubeassociation.tnoodle.server.pdf.model.properties.Font

sealed interface FontableElement {
    val fontName: String?
    val fontSize: Float
    val fontWeight: Font.Weight
}
