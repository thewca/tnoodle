package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import kotlinx.serialization.*
import net.gnehzr.tnoodle.scrambles.PuzzleImageInfo

@Serializer(forClass = PuzzleImageInfo::class)
object PuzzleImageInfoizer : KSerializer<PuzzleImageInfo> {
    override fun serialize(encoder: Encoder, obj: PuzzleImageInfo) {
        val dim = DimensionJsonData(obj.size.width, obj.size.height)
        val jsonData = PuzzleImageJsonData(dim, obj.colorScheme)

        encoder.encodeSerializableValue(PuzzleImageJsonData.serializer(), jsonData)
    }
}
