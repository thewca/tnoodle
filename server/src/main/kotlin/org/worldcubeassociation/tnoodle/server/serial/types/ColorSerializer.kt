package org.worldcubeassociation.tnoodle.server.serial.types

import org.worldcubeassociation.tnoodle.svglite.Color

object ColorSerializer : SingletonStringEncoder<Color>("Color") {
    override fun encodeInstance(instance: Color) = instance.toHex()
    override fun makeInstance(deserialized: String) = Color(deserialized)
}
