package org.worldcubeassociation.tnoodle.server.wcif.model.result

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.serial.types.DurationSecondsSerializer
import java.time.Duration

@Serializable
data class MultiBldResult(val solved: Int, val attempted: Int, val time: @Serializable(with = DurationSecondsSerializer::class) Duration) {
    val unsolved: Int
        get() = attempted - solved

    val points: Int
        get() = solved - unsolved

    fun isDnf(): Boolean {
        if (attempted == 2) {
            return solved == 2 // 1/2 is not a valid result despite hitting the 50% mark.
        }

        return points >= 0
    }

    fun encodeToWCA(): String {
        val dd = (MULTIBLD_NEW_BASE_VALUE - points).toString().padStart(2, PREFIX_MULTIBLD_FORMAT_NEW)
        val mm = unsolved.toString().padStart(2, PREFIX_MULTIBLD_FORMAT_NEW)
        val ttttt = time.seconds.toString().padStart(5, PREFIX_MULTIBLD_FORMAT_NEW)

        return "$PREFIX_MULTIBLD_FORMAT_NEW$dd$ttttt$mm"
    }

    companion object {
        const val PREFIX_MULTIBLD_FORMAT_NEW = '0'
        const val LENGTH_MULTIBLD_FORMAT_NEW = 10

        private const val MULTIBLD_NEW_BASE_VALUE = 99

        fun parse(encodedWcaValue: Int): MultiBldResult? {
            val padded = encodedWcaValue.toString().padStart(LENGTH_MULTIBLD_FORMAT_NEW, PREFIX_MULTIBLD_FORMAT_NEW)
            return parse(padded)
        }

        fun parse(encodedValue: String): MultiBldResult? {
            if (!encodedValue.startsWith(PREFIX_MULTIBLD_FORMAT_NEW) || encodedValue.length != LENGTH_MULTIBLD_FORMAT_NEW) {
                return null
            }

            val dd = encodedValue.substring(1, 3)
            val ttttt = encodedValue.substring(3, 8)
            val mm = encodedValue.substring(8, 10)

            val duration = Duration.ofSeconds(ttttt.toLong())
            val difference = MULTIBLD_NEW_BASE_VALUE - dd.toInt()
            val missed = mm.toInt()

            val solved = difference + missed
            val attempted = solved + missed

            return MultiBldResult(solved, attempted, duration)
        }
    }
}
