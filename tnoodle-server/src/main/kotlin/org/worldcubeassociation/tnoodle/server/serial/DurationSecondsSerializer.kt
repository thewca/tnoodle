package org.worldcubeassociation.tnoodle.server.serial

import java.time.Duration

object DurationSecondsSerializer : SingletonIntEncoder<Duration>("Duration") {
    override fun encodeInstance(instance: Duration) = instance.seconds.toInt()
    override fun makeInstance(deserialized: Int) = Duration.ofSeconds(deserialized.toLong())
}
