package org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.properties

import kotlin.math.roundToInt

object Paper {
    enum class Size(val widthIn: Float, val heightIn: Float) {
        A4(210.mmToInch, 297.mmToInch);

        companion object {
            val DEFAULT = A4
        }
    }

    // In the PDF specification, a user unit is defined to be 1/72.
    // Most third-party rendering engines don't support changing this value,
    // so for the time being we don't either.
    const val DPI = 72

    const val INCH_TO_CM = 2.54f

    val Int.mmToInch get(): Float = this / (10 * INCH_TO_CM)
    val Int.pixelsToInch get(): Float = this.toFloat() / DPI
    val Float.inchesToPixelPrecise get(): Float = this * DPI
    // TODO is it okay to round here?
    val Float.inchesToPixel get(): Int = inchesToPixelPrecise.roundToInt()
}
