package org.worldcubeassociation.tnoodle.server.serial

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonConfiguration

object JsonConfig {
    const val CLASS_DISCRIMINATOR = "id"

    val TNOODLE_DEFAULT = JsonConfiguration.Stable
        .copy(encodeDefaults = false, strictMode = false, classDiscriminator = CLASS_DISCRIMINATOR)

    val SERIALIZER by lazy { Json(TNOODLE_DEFAULT) }
}
