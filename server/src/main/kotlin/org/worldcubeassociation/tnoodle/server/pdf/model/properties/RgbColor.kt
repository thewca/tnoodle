package org.worldcubeassociation.tnoodle.server.pdf.model.properties

data class RgbColor(
    val r: Int,
    val g: Int,
    val b: Int,
    val a: Float = 1f
) {
    companion object {
        val DEFAULT: RgbColor? = null
    }
}
