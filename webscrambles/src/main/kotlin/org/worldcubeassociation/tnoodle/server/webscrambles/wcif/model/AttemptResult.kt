package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Transient
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.SingletonStringEncoder
import java.time.Duration

// value has to be string to preserve leading zeros from MBLD
data class AttemptResult(val value: String) {
    @Transient
    private val intValue = value.toInt()

    val isSkipped
        get() = this.intValue == ATTEMPT_SKIPPED

    val isDnf
        get() = this.intValue == ATTEMPT_DNF

    val isDns
        get() = this.intValue == ATTEMPT_DNS

    val asDuration
        get() = Duration.ofMillis(this.intValue * CENTISECONDS_TO_MILLISECONDS)

    val asFmcAverage
        get() = this.intValue / 100f

    val asMultiResult
        get() = decodeMultiResult(this.value)

    companion object : SingletonStringEncoder<AttemptResult>("AttemptResult") {
        const val ATTEMPT_SKIPPED = 0
        const val ATTEMPT_DNF = -1
        const val ATTEMPT_DNS = -2

        const val CENTISECONDS_TO_MILLISECONDS = 10L

        const val PREFIX_MULTIBLD_FORMAT_NEW = '0'
        const val LENGTH_MULTIBLD_FORMAT_NEW = 10

        private const val MULTIBLD_NEW_BASE_VALUE = 99

        fun decodeMultiResult(encodedValue: String): Triple<Int, Int, Duration>? {
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

            return Triple(solved, attempted, duration)
        }

        fun encodeMultiResult(solved: Int, attempted: Int, time: Duration): String {
            val missed = attempted - solved
            val difference = solved - missed

            val dd = (MULTIBLD_NEW_BASE_VALUE - difference).toString().padStart(2, PREFIX_MULTIBLD_FORMAT_NEW)
            val mm = missed.toString().padStart(2, PREFIX_MULTIBLD_FORMAT_NEW)
            val ttttt = time.seconds.toString().padStart(5, PREFIX_MULTIBLD_FORMAT_NEW)

            return "$PREFIX_MULTIBLD_FORMAT_NEW$dd$ttttt$mm"
        }

        override fun encodeInstance(instance: AttemptResult) = instance.value
        override fun makeInstance(deserialized: String) = AttemptResult(deserialized)
    }
}
