package org.worldcubeassociation.tnoodle.server.webscrambles.zip.util

import org.apache.commons.lang3.StringUtils
import java.security.SecureRandom

object StringUtil {
    private const val INVALID_CHARS = "\\/:*?\"<>|"

    // Excludes ambiguous characters: 0/O, 1/I
    private const val PASSCODE_DIGIT_SET = "23456789abcdefghijkmnpqrstuvwxyz"
    private const val PASSCODE_NUM_CHARS = 8

    fun String.toFileSafeString() = filter { it !in INVALID_CHARS }
    fun String.stripNewlines() = lines().joinToString(" ")
    fun String.stripDiacritics(): String = StringUtils.stripAccents(this)

    fun randomPasscode(): String {
        val secureRandom = SecureRandom()

        return 0.until(PASSCODE_NUM_CHARS)
            .map { secureRandom.nextInt(PASSCODE_DIGIT_SET.length) }
            .map { PASSCODE_DIGIT_SET[it] }
            .joinToString("")
    }

    private tailrec fun String.toUniqueTitle(seenTitles: Set<String>, suffixSalt: Int = 0): String {
        val suffixedTitle = "$this (${suffixSalt})"
            .takeUnless { suffixSalt == 0 } ?: this

        if (suffixedTitle !in seenTitles) {
            return suffixedTitle
        }

        return toUniqueTitle(seenTitles, suffixSalt + 1)
    }

    fun <T> List<T>.withUniqueTitles(titleGen: (T) -> String = { it.toString() }): Map<String, T> {
        return fold(emptyMap()) { acc, req ->
            val fileTitle = titleGen(req).toFileSafeString()
            val safeTitle = fileTitle.toUniqueTitle(acc.keys)

            acc + (safeTitle to req)
        }
    }
}
