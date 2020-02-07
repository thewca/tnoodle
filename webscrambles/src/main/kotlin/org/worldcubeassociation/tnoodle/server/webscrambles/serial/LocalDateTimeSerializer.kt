package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import kotlinx.serialization.*
import kotlinx.serialization.internal.StringDescriptor
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Serializer(forClass = LocalDateTime::class)
object LocalDateTimeSerializer : KSerializer<LocalDateTime> {
    val ENC_DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE_TIME

    override val descriptor: SerialDescriptor
        get() = StringDescriptor.withName("LocalDateTime")

    override fun serialize(encoder: Encoder, obj: LocalDateTime) {
        encoder.encodeString(obj.format(ENC_DATE_FORMAT))
    }

    override fun deserialize(decoder: Decoder): LocalDateTime {
        return LocalDateTime.parse(decoder.decodeString(), ENC_DATE_FORMAT)
    }
}
