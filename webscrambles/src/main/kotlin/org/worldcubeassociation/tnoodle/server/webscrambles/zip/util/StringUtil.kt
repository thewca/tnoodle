package org.worldcubeassociation.tnoodle.server.webscrambles.zip.util

import java.security.SecureRandom

object StringUtil {
    private const val INVALID_CHARS = "\\/:*?\"<>|"

    // Excludes ambiguous characters: 0/O, 1/I
    private const val PASSCODE_DIGIT_SET = "23456789abcdefghijkmnpqrstuvwxyz"
    private const val PASSCODE_NUM_CHARS = 8

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
