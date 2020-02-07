package org.worldcubeassociation.tnoodle.server.serial

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonConfiguration

object JsonConfig {
    const val SERIALIZER_TNOODLE = "tnoodle"
    const val SERIALIZER_WCIF = "wcif"

    val TNOODLE_DEFAULT = JsonConfiguration.Stable
        .copy(encodeDefaults = false, strictMode = false)

    val WCIF_DEFAULT = TNOODLE_DEFAULT.copy(classDiscriminator = "id")

    @Deprecated("Use getSerializer() instead")
    val SERIALIZER by lazy { Json(TNOODLE_DEFAULT) }

    private val SERIALIZERS = mapOf(
        SERIALIZER_TNOODLE to TNOODLE_DEFAULT,
        SERIALIZER_WCIF to WCIF_DEFAULT
    ).mapValues { lazy { Json(it.value) } }

    operator fun get(configPrefix: String) = SERIALIZERS[configPrefix]?.value ?: error("No serializer named $configPrefix found")
}
