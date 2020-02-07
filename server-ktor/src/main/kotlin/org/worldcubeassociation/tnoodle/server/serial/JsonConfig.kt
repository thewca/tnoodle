package org.worldcubeassociation.tnoodle.server.serial

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonConfiguration

object JsonConfig {
    val TNOODLE_DEFAULT = JsonConfiguration.Stable
        .copy(encodeDefaults = false, strictMode = false)

    val SERIALIZER by lazy { Json(TNOODLE_DEFAULT) }
}
