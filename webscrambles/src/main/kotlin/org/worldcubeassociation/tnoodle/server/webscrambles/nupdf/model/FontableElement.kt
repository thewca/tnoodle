package org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model

import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.properties.Font

sealed interface FontableElement {
    val fontName: String?
    val fontSize: Float
    val fontWeight: Font.Weight
}
