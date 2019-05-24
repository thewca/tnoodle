package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import java.security.SecureRandom

object StringUtil {
    private const val INVALID_CHARS = "\\/:*?\"<>|"

    // Excludes ambiguous characters: 0/O, 1/I
    private const val PASSCODE_DIGIT_SET = "23456789abcdefghijkmnpqrstuvwxyz"
    private const val PASSCODE_NUM_CHARS = 8

    fun padTurnsUniformly(scramble: String, padding: String): String {
        var turns = scramble.split("\\s+".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
        var maxTurnLength = 0
        for (turn in turns) {
            maxTurnLength = Math.max(maxTurnLength, turn.length)
        }

        val s = StringBuilder()

        val lines = scramble.split("\\n".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
        for (i in lines.indices) {
            val line = lines[i]
            if (i > 0) {
                s.append("\n")
            }
            turns = line.split("\\s+".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
            for (j in turns.indices) {
                var turn = turns[j]
                if (j > 0) {
                    s.append(" ")
                }

                // TODO - this is a disgusting hack for sq1. We don't pad the /
                // turns because they're guaranteed to occur as every other turn,
                // so stuff will line up nicely without padding them. I don't know
                // what a good general solution to this problem is.
                if (turn != "/") {
                    while (turn.length < maxTurnLength) {
                        turn += padding
                    }
                }
                s.append(turn)
            }
        }

        return s.toString()
    }

    fun toFileSafeString(unsafe: String) = unsafe.filter { it !in INVALID_CHARS }

    fun stripNewlines(strings: List<String>) = strings.map { it.replace("\n", " ") }

    fun randomPasscode(): String {
        val secureRandom = SecureRandom()
        val builder = StringBuilder()
        for (i in 0 until PASSCODE_NUM_CHARS) {
            val idx = secureRandom.nextInt(PASSCODE_DIGIT_SET.length)
            builder.append(PASSCODE_DIGIT_SET[idx])
        }
        return builder.toString()
    }
}
