package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.*
import kotlinx.serialization.json.JsonObject
import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.ExtensionBuilder

@Serializable
data class Extension(val id: String, val specUrl: String, val data: JsonObject) {
    val jsonObject
        get() = JsonConfig.SERIALIZER.toJson(serializer(), this).jsonObject

    inline fun <reified T : ExtensionBuilder> parsedData(): T? {
        if (id !in ExtensionBuilder.REGISTERED_CHILDREN) {
            return null
        }

        val mockData = jsonObject.content - "data" + data.content
        val mockExtension = JsonObject(mockData)

        return JsonConfig.SERIALIZER.fromJson(ExtensionBuilder.serializer(), mockExtension) as? T
    }
}
