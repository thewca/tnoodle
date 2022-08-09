package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.dsl

import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.TurtleCommand
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Paper.inchesToPixelPrecise
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.RgbColor

class CanvasBuilder(val safeStroke: Boolean, val page: PageBuilder) : ElementBuilder(page) {
    private val commands = mutableListOf<TurtleCommand>()

    private var position = 0f to 0f

    fun moveTo(x: Float, y: Float) {
        commands.add(TurtleCommand.MoveTo(x, y))
        position = x to y
    }

    fun moveInDirection(x: Float, y: Float) {
        val newX = position.first + x
        val newY = position.second + y

        moveTo(newX, newY)
    }

    fun topLeftCorner() {
        val topLeftX = page.marginLeft.toFloat()
        val topLeftY = page.size.heightIn.inchesToPixelPrecise - page.marginTop

        moveTo(topLeftX, topLeftY)
    }

    fun topRightCorner() {
        val topRightX = page.size.widthIn.inchesToPixelPrecise - page.marginRight
        val topRightY = page.size.heightIn.inchesToPixelPrecise - page.marginTop

        moveTo(topRightX, topRightY)
    }

    fun lineTo(x: Float, y: Float) {
        commands.add(TurtleCommand.LineTo(x, y))
        position = position.first + x to position.second + y
    }

    fun lineInDirection(x: Float, y: Float) {
        val newX = position.first + x
        val newY = position.second + y

        lineTo(newX, newY)
    }

    fun stroke() {
        commands.add(TurtleCommand.Stroke)
    }

    fun setLineWidth(width: Float) {
        commands.add(TurtleCommand.SetLineWidth(width))
    }

    fun setStrokeColor(color: RgbColor) {
        commands.add(TurtleCommand.SetStrokeColor(color))
    }

    fun compile(): List<TurtleCommand> {
        if (this.safeStroke && commands.lastOrNull() != TurtleCommand.Stroke)
            stroke()

        return commands
    }
}
