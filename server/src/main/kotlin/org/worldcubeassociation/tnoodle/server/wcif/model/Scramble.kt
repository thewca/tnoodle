package org.worldcubeassociation.tnoodle.server.wcif.model

import kotlinx.serialization.*
import org.worldcubeassociation.tnoodle.server.serial.types.SingletonStringEncoder

@Serializable
data class Scramble(val scrambleString: String) {
    val allScrambleStrings: List<String>
        get() = scrambleString.split(WCIF_NEWLINE_CHAR)

    companion object : SingletonStringEncoder<Scramble>("Scramble") {
        const val WCIF_NEWLINE_CHAR = "\n"

        override fun encodeInstance(instance: Scramble) = instance.scrambleString
        override fun makeInstance(deserialized: String) = Scramble(deserialized)
    }
}
