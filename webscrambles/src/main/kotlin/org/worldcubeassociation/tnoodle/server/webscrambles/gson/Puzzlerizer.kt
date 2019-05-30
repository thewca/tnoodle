package org.worldcubeassociation.tnoodle.server.webscrambles.gson

import com.google.gson.*
import net.gnehzr.tnoodle.scrambles.Puzzle
import org.worldcubeassociation.tnoodle.server.webscrambles.PuzzlePlugins
import java.lang.reflect.Type

// registerTypeHierarchyAdapter
class Puzzlerizer : JsonSerializer<Puzzle>, JsonDeserializer<Puzzle> {
    override fun deserialize(json: JsonElement, typeOfT: Type, context: JsonDeserializationContext): Puzzle {
        try {
            val scramblerName = json.asString
            val scramblers = PuzzlePlugins.PUZZLES

            return scramblers[scramblerName]
                ?: throw JsonParseException("$scramblerName not found in: ${scramblers.keys}")
        } catch (e: Exception) {
            throw JsonParseException(e)
        }
    }

    override fun serialize(scrambler: Puzzle, typeOfT: Type, context: JsonSerializationContext): JsonElement {
        return JsonPrimitive(scrambler.shortName)
    }
}
