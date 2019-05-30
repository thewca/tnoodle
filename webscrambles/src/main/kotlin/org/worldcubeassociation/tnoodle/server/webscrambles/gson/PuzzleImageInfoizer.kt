package org.worldcubeassociation.tnoodle.server.webscrambles.gson

import com.google.gson.JsonElement
import com.google.gson.JsonSerializationContext
import com.google.gson.JsonSerializer
import net.gnehzr.tnoodle.scrambles.PuzzleImageInfo
import java.lang.reflect.Type

class PuzzleImageInfoizer : JsonSerializer<PuzzleImageInfo> {
    override fun serialize(pii: PuzzleImageInfo, typeOfT: Type, context: JsonSerializationContext): JsonElement {
        return context.serialize(pii.toJsonable())
    }
}
