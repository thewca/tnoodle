package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import java.time.Duration

data class AttemptResult(val value: Int) {
    val isSkipped
        get() = this.value == ATTEMPT_SKIPPED

    val isDnf
        get() = this.value == ATTEMPT_DNF

    val isDns
        get() = this.value == ATTEMPT_DNS

    val asDuration
        get() = Duration.ofMillis(this.value * CENTISECONDS_TO_MILLISECONDS)

    val asFmcAverage
        get() = this.value / 100f

    val asMultiResult
        get() = decodeMultiResult(this.value)

    companion object {
        const val ATTEMPT_SKIPPED = 0
        const val ATTEMPT_DNF = -1
        const val ATTEMPT_DNS = -2

        const val CENTISECONDS_TO_MILLISECONDS = 10L

        const val PREFIX_MULTIBLD_FORMAT_NEW = '0'
        const val LENGTH_MULTIBLD_FORMAT_NEW = 10

        private const val MULTIBLD_NEW_BASE_VALUE = 99

        fun decodeMultiResult(encodedValue: Int): Triple<Int, Int, Duration>? {
            val encodedString = encodedValue.toString().padStart(LENGTH_MULTIBLD_FORMAT_NEW, PREFIX_MULTIBLD_FORMAT_NEW)

            if (!encodedString.startsWith(PREFIX_MULTIBLD_FORMAT_NEW) || encodedString.length != LENGTH_MULTIBLD_FORMAT_NEW) {
                return null
            }

            val dd = encodedString.substring(1, 3)
            val ttttt = encodedString.substring(3, 8)
            val mm = encodedString.substring(8, 10)

            val duration = Duration.ofSeconds(ttttt.toLong())
            val difference = MULTIBLD_NEW_BASE_VALUE - dd.toInt()
            val missed = mm.toInt()

            val solved = difference + missed
            val attempted = solved + missed

            return Triple(attempted, solved, duration)
        }

        fun encodeMultiResult(solved: Int, attempted: Int, time: Duration): Int {
            val missed = attempted - solved
            val difference = solved - missed

            val dd = (MULTIBLD_NEW_BASE_VALUE - difference).toString().padStart(2, PREFIX_MULTIBLD_FORMAT_NEW)
            val mm = missed.toString().padStart(2, PREFIX_MULTIBLD_FORMAT_NEW)
            val ttttt = time.seconds.toString().padStart(5, PREFIX_MULTIBLD_FORMAT_NEW)

            val stringRepresentation = "$PREFIX_MULTIBLD_FORMAT_NEW$dd$ttttt$mm"
            return stringRepresentation.toInt()
        }
    }
}
