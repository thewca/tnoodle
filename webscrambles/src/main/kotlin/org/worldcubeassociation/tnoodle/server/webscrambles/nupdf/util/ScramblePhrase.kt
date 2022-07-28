package org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.util

import kotlin.math.ceil

data class ScramblePhrase(
    val scramble: String,
    val rawTokens: List<Pair<String, Boolean>>,
    val lineTokens: List<List<String>>,
    val fontSize: Float
) {
    companion object {
        val NBSP_STRING = Typography.nbsp.toString()

        val MIN_ONE_LINE_FONT_SIZE = 15f
        val MAX_PHRASE_FONT_SIZE = 20f

        fun padTurnsUniformly(scramble: String, padding: String = NBSP_STRING): String {
            val maxTurnLength = scramble.split("\\s+".toRegex()).maxOfOrNull { it.length } ?: 0
            val lines = scramble.lines().dropLastWhile { it.isEmpty() }

            return lines.joinToString("\n") { line ->
                val lineTurns = line.split("\\s+".toRegex()).dropLastWhile { it.isEmpty() }

                lineTurns.joinToString(" ") { turn ->
                    val missingPad = maxTurnLength - turn.length
                    val repetitions = ceil(missingPad.toDouble() / padding.length)

                    val actualPadding = padding.repeat(repetitions.toInt())
                        // TODO - this is a disgusting hack for sq1. We don't pad the /
                        // turns because they're guaranteed to occur as every other turn,
                        // so stuff will line up nicely without padding them. I don't know
                        // what a good general solution to this problem is.
                        .takeUnless { turn == "/" }
                        .orEmpty()

                    turn + actualPadding
                }
            }
        }

        fun splitToChunks(scramble: String): List<Pair<String, Boolean>> {
            // replace \n from Mega with regular spaces.
            val flat = scramble.lines().joinToString(" ")

            // make sure we're splitting at space, NOT at non-breakable space!
            val paddedMoves = padTurnsUniformly(flat).split(" ")

            val isSquareOne = "/" in scramble
            val isMegaminx = "\n" in scramble

            val lineBreaks = paddedMoves.map {
                if (isSquareOne) it == "/" else
                    if (isMegaminx) it.first() == 'U' else
                        true
            }

            return paddedMoves.zip(lineBreaks)
        }
    }
}
