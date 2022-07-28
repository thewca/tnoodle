package org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.properties

object Drawing {
    enum class Border {
        FULL, ROWS_ONLY, COLS_ONLY, NONE;

        companion object {
            val DEFAULT = FULL
        }
    }

    enum class Stroke {
        THROUGH, DASHED, DOTTED;

        companion object {
            val DEFAULT = THROUGH
        }
    }

    object Padding {
        const val DEFAULT = 2
    }

    object Margin {
        const val DEFAULT_HORIZONTAL = 35
        const val DEFAULT_VERTICAL = 75
    }
}
