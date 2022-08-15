package org.worldcubeassociation.tnoodle.core.model.pdf

import org.worldcubeassociation.tnoodle.core.model.pdf.properties.Font

sealed interface FontableElement {
    val fontName: String?
    val fontSize: Float
    val fontWeight: Font.Weight
}
