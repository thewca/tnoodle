package org.worldcubeassociation.tnoodle.server.webscrambles.gson

import net.gnehzr.tnoodle.scrambles.PuzzleImageInfo
import java.lang.reflect.Type

// registerTypeAdapter
class PuzzleImageInfoizer : JsonSerializer<PuzzleImageInfo> {
    override fun serialize(pii: PuzzleImageInfo, typeOfT: Type, context: JsonSerializationContext): JsonElement {
        return context.serialize(pii.toJsonable())
    }
}
