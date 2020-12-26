package org.worldcubeassociation.tnoodle.server.serial

import kotlinx.serialization.json.Json

object JsonConfig {
    const val CLASS_DISCRIMINATOR = "id"

    val SERIALIZER by lazy { Json {
        encodeDefaults = false
        ignoreUnknownKeys = true
        classDiscriminator = CLASS_DISCRIMINATOR
    } }
}
