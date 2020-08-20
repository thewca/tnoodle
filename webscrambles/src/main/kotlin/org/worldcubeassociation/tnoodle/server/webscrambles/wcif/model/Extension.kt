package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.*
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.ExtensionBuilder

@Serializable
data class Extension(val id: String, val specUrl: String, val data: JsonObject) {
    inline fun <reified T : ExtensionBuilder> parsedData(): T? {
        if (id !in ExtensionBuilder.REGISTERED_CHILDREN) {
            return null
        }

        val mockData = buildJsonObject { put(JsonConfig.CLASS_DISCRIMINATOR, id) } + data
        val mockExtension = JsonObject(mockData)

        return JsonConfig.SERIALIZER.decodeFromJsonElement(ExtensionBuilder.serializer(), mockExtension) as? T
    }
}
