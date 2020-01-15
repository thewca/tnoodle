package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import kotlinx.serialization.*
import kotlinx.serialization.internal.StringDescriptor
import net.gnehzr.tnoodle.svglite.Color

@Serializer(forClass = Color::class)
object Colorizer : KSerializer<Color> {
    override val descriptor: SerialDescriptor = StringDescriptor.withName("Color")

    override fun serialize(encoder: Encoder, obj: Color) {
        encoder.encodeString(obj.toHex())
    }

    override fun deserialize(decoder: Decoder): Color {
        return Color(decoder.decodeString())
    }
}
