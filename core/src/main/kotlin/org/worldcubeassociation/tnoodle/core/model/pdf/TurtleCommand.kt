package org.worldcubeassociation.tnoodle.core.model.pdf

import org.worldcubeassociation.tnoodle.core.model.pdf.properties.RgbColor

sealed class TurtleCommand {
    class MoveTo(val x: Float, val y: Float): TurtleCommand()
    class LineTo(val x: Float, val y: Float): TurtleCommand()

    class SetLineWidth(val width: Float): TurtleCommand()
    class SetStrokeColor(val color: RgbColor): TurtleCommand()

    object Stroke: TurtleCommand()
}
