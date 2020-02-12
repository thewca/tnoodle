package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.*
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.json
import org.worldcubeassociation.tnoodle.server.serial.JsonConfig
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.ExtensionBuilder

@Serializable
data class Extension(val id: String, val specUrl: String, val data: JsonObject) {
    inline fun <reified T : ExtensionBuilder> parsedData(): T? {
        if (id !in ExtensionBuilder.REGISTERED_CHILDREN) {
            return null
        }

        val mockConstruction = json {
            "id" to id
            "specUrl" to specUrl

            for ((k, v) in data) {
                k to v
            }
        }

        return JsonConfig.SERIALIZER.fromJson(ExtensionBuilder.serializer(), mockConstruction) as? T
    }
}
