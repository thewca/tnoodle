package org.worldcubeassociation.tnoodle.server.util

import kotlin.math.*

object StringUtil {
    fun String.stripNewlines() = lines().joinToString(" ")

    fun Int.toColumnIndexString(): String {
        val iterLength = max(1, ceil(log(this.toFloat(), 26f)).roundToInt())

        return List(iterLength) {
            '@' + ((this / 26f.pow(it).toInt()) % 26)
        }.joinToString("").reversed()
    }
}
