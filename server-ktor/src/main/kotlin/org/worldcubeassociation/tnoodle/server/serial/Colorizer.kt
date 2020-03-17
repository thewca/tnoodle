package org.worldcubeassociation.tnoodle.server.serial

import org.worldcubeassociation.tnoodle.server.serial.SingletonStringEncoder
import org.worldcubeassociation.tnoodle.svglite.Color

object Colorizer : SingletonStringEncoder<Color>("Color") {
    override fun encodeInstance(instance: Color) = instance.toHex()
    override fun makeInstance(deserialized: String) = Color(deserialized)
}
