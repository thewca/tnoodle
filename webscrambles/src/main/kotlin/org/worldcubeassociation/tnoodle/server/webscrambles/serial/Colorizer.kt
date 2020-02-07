package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import kotlinx.serialization.*
import kotlinx.serialization.internal.StringDescriptor
import net.gnehzr.tnoodle.svglite.Color

@Serializer(forClass = Color::class)
object Colorizer : SingletonStringEncoder<Color>("Color") {
    override fun encodeInstance(instance: Color) = instance.toHex()
    override fun makeInstance(deserialized: String) = Color(deserialized)
}
