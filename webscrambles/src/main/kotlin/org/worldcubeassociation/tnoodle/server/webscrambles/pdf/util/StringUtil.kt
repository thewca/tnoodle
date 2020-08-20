package org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util

import java.security.SecureRandom
import kotlin.math.ceil

object StringUtil {
    private const val INVALID_CHARS = "\\/:*?\"<>|"

    // Excludes ambiguous characters: 0/O, 1/I
    private const val PASSCODE_DIGIT_SET = "23456789abcdefghijkmnpqrstuvwxyz"
    private const val PASSCODE_NUM_CHARS = 8

    fun padTurnsUniformly(scramble: String, padding: String): String {
        val maxTurnLength = scramble.split("\\s+".toRegex()).map { it.length }.maxOrNull() ?: 0

        val lines = scramble.split("\\n".toRegex()).dropLastWhile { it.isEmpty() }

        return lines.joinToString("\n") { line ->
            val lineTurns = line.split("\\s+".toRegex()).dropLastWhile { it.isEmpty() }

            lineTurns.joinToString(" ") { turn ->
                // TODO - this is a disgusting hack for sq1. We don't pad the /
                // turns because they're guaranteed to occur as every other turn,
                // so stuff will line up nicely without padding them. I don't know
                // what a good general solution to this problem is.
                val missingPad = maxTurnLength - turn.length
                val repetitions = ceil(missingPad.toDouble() / padding.length)

                val actualPadding = padding.repeat(repetitions.toInt()).takeUnless { turn == "/" }

                turn + actualPadding.orEmpty()
            }
        }
    }

    fun String.toFileSafeString() = filter { it !in INVALID_CHARS }
    fun List<String>.stripNewlines() = map { it.replace("\n", " ") }

    fun randomPasscode(): String {
        val secureRandom = SecureRandom()

        return 0.until(PASSCODE_NUM_CHARS)
            .map { secureRandom.nextInt(PASSCODE_DIGIT_SET.length) }
            .map { PASSCODE_DIGIT_SET[it] }
            .joinToString("")
    }
}
