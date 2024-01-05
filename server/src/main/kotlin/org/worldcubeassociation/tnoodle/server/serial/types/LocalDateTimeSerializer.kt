package org.worldcubeassociation.tnoodle.server.serial.types

import org.worldcubeassociation.tnoodle.server.Translate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

object LocalDateTimeSerializer : SingletonStringEncoder<LocalDateTime>("LocalDateTime") {
    const val ENC_DATE_PATTERN = "MMM dd, yyyy h:m:s a"

    val ENC_DATE_FORMAT = DateTimeFormatter
        .ofPattern(ENC_DATE_PATTERN, Translate.DEFAULT_LOCALE)

    override fun encodeInstance(instance: LocalDateTime) = instance.format(ENC_DATE_FORMAT)
    override fun makeInstance(deserialized: String) = LocalDateTime.parse(deserialized, ENC_DATE_FORMAT)
}
