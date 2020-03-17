package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import org.worldcubeassociation.tnoodle.server.serial.SingletonIntEncoder
import java.time.Duration

object DurationSecondsSerializer : SingletonIntEncoder<Duration>("Duration") {
    override fun encodeInstance(instance: Duration) = instance.seconds.toInt()
    override fun makeInstance(deserialized: Int) = Duration.ofSeconds(deserialized.toLong())
}
