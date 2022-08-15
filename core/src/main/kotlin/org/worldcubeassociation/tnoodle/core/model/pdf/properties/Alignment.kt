package org.worldcubeassociation.tnoodle.core.model.pdf.properties

object Alignment {
    enum class Horizontal {
        LEFT, CENTER, RIGHT, JUSTIFIED;

        companion object {
            val DEFAULT = LEFT
        }
    }

    enum class Vertical {
        TOP, MIDDLE, BOTTOM;

        companion object {
            val DEFAULT = TOP
        }
    }
}
