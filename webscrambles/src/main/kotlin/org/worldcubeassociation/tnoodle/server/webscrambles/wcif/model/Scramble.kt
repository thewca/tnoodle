package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.*
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.SingletonStringEncoder

@Serializable
data class Scramble(val scrambleString: String) {
    val allScrambleStrings: List<String>
        get() = scrambleString.split(WCIF_NEWLINE_CHAR)

    @Serializer(forClass = Scramble::class)
    companion object : SingletonStringEncoder<Scramble>("Scramble") {
        const val WCIF_NEWLINE_CHAR = "\n"

        override fun encodeInstance(instance: Scramble) = instance.scrambleString
        override fun makeInstance(deserialized: String) = Scramble(deserialized)
    }
}
