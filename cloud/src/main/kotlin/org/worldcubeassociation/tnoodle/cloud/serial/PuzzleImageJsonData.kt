package org.worldcubeassociation.tnoodle.cloud.serial

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.core.serial.ColorSerializer
import org.worldcubeassociation.tnoodle.svglite.Color

@Serializable
data class PuzzleImageJsonData(
    val size: DimensionJsonData,
    val colorScheme: Map<String, @Serializable(with = ColorSerializer::class) Color>
) {
    constructor(width: Int, height: Int, colorScheme: Map<String, Color>) : this(DimensionJsonData(width, height), colorScheme)
}

@Serializable
data class DimensionJsonData(val width: Int, val height: Int)
