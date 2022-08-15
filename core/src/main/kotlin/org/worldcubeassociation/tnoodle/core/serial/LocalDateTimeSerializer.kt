package org.worldcubeassociation.tnoodle.core.serial

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*

object LocalDateTimeSerializer : SingletonStringEncoder<LocalDateTime>("LocalDateTime") {
    const val ENC_DATE_PATTERN = "MMM dd, yyyy h:m:s a"

    val BASE_LOCALE = Locale.forLanguageTag("en")

    val ENC_DATE_FORMAT = DateTimeFormatter
        .ofPattern(ENC_DATE_PATTERN, BASE_LOCALE)

    override fun encodeInstance(instance: LocalDateTime) = instance.format(ENC_DATE_FORMAT)
    override fun makeInstance(deserialized: String) = LocalDateTime.parse(deserialized, ENC_DATE_FORMAT)
}
