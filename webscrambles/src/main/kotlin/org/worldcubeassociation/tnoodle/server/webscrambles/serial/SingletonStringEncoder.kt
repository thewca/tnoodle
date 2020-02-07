package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import kotlinx.serialization.*
import kotlinx.serialization.internal.StringDescriptor

abstract class SingletonStringEncoder<T>(val descriptionString: String) : KSerializer<T> {
    override val descriptor: SerialDescriptor
        get() = StringDescriptor.withName(descriptionString)

    override fun deserialize(decoder: Decoder) = makeInstance(decoder.decodeString())

    override fun serialize(encoder: Encoder, obj: T) = encoder.encodeString(encodeInstance(obj))

    abstract fun encodeInstance(instance: T): String
    abstract fun makeInstance(deserialized: String): T
}
