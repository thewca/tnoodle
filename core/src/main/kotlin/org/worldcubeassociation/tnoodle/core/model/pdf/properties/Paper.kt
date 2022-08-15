package org.worldcubeassociation.tnoodle.core.model.pdf.properties

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
    // PDF doesn't round so we don't round.
    val Float.inchesToPixel get(): Int = inchesToPixelPrecise.toInt()
}
