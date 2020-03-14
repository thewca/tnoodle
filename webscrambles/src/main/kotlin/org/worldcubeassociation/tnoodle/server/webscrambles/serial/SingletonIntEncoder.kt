package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import kotlinx.serialization.*

abstract class SingletonIntEncoder<T>(val descriptionString: String) : KSerializer<T> {
    override val descriptor: SerialDescriptor
        get() = PrimitiveDescriptor(descriptionString, PrimitiveKind.INT)

    override fun deserialize(decoder: Decoder) = makeInstance(decoder.decodeInt())

    override fun serialize(encoder: Encoder, value: T) = encoder.encodeInt(encodeInstance(value))

    abstract fun encodeInstance(instance: T): Int
    abstract fun makeInstance(deserialized: Int): T
}
