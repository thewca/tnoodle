package org.worldcubeassociation.tnoodle.server.serial

import kotlinx.serialization.KSerializer
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder

abstract class SingletonIntEncoder<T>(val descriptionString: String) : KSerializer<T> {
    override val descriptor: SerialDescriptor
        get() = PrimitiveSerialDescriptor(descriptionString, PrimitiveKind.INT)

    override fun deserialize(decoder: Decoder) = makeInstance(decoder.decodeInt())

    override fun serialize(encoder: Encoder, value: T) = encoder.encodeInt(encodeInstance(value))

    abstract fun encodeInstance(instance: T): Int
    abstract fun makeInstance(deserialized: Int): T
}
