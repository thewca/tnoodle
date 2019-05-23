package org.worldcubeassociation.tnoodle.utils.gson

import com.google.gson.*
import org.worldcubeassociation.tnoodle.svglite.Color
import java.lang.reflect.Type

// registerTypeAdapter
class Colorizer : JsonSerializer<Color>, JsonDeserializer<Color> {
    override fun serialize(c: Color, t: Type, context: JsonSerializationContext): JsonElement {
        return JsonPrimitive(c.toHex())
    }

    override fun deserialize(json: JsonElement, t: Type, context: JsonDeserializationContext): Color {
        return Color(json.asString)
    }
}
