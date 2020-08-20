package org.worldcubeassociation.tnoodle.server.serial

import kotlinx.serialization.KSerializer
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder

abstract class SingletonStringEncoder<T>(val descriptionString: String) : KSerializer<T> {
    override val descriptor: SerialDescriptor
        get() = PrimitiveSerialDescriptor(descriptionString, PrimitiveKind.STRING)

    override fun deserialize(decoder: Decoder) = makeInstance(decoder.decodeString())

    override fun serialize(encoder: Encoder, value: T) = encoder.encodeString(encodeInstance(value))

    abstract fun encodeInstance(instance: T): String
    abstract fun makeInstance(deserialized: String): T
}
