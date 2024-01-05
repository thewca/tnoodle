package org.worldcubeassociation.tnoodle.server.pdf.model

import org.worldcubeassociation.tnoodle.server.pdf.model.properties.RgbColor

sealed class TurtleCommand {
    class MoveTo(val x: Float, val y: Float): TurtleCommand()
    class LineTo(val x: Float, val y: Float): TurtleCommand()

    class SetLineWidth(val width: Float): TurtleCommand()
    class SetStrokeColor(val color: RgbColor): TurtleCommand()

    object Stroke: TurtleCommand()
}
