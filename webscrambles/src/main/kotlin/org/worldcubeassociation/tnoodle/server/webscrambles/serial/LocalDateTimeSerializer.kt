package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import kotlinx.serialization.*
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Serializer(forClass = LocalDateTime::class)
object LocalDateTimeSerializer : SingletonStringEncoder<LocalDateTime>("LocalDateTime") {
    val ENC_DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE_TIME

    override fun encodeInstance(instance: LocalDateTime) = instance.format(ENC_DATE_FORMAT)
    override fun makeInstance(deserialized: String) = LocalDateTime.parse(deserialized, ENC_DATE_FORMAT)
}
