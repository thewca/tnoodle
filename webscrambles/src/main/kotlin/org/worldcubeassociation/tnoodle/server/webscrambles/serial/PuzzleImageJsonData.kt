package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.svglite.Color

@Serializable
data class PuzzleImageJsonData(
    val size: DimensionJsonData,
    val colorScheme: Map<String, @Serializable(with = Colorizer::class) Color>
) {
    constructor(width: Int, height: Int, colorScheme: Map<String, Color>) : this(DimensionJsonData(width, height), colorScheme)
}

@Serializable
data class DimensionJsonData(val width: Int, val height: Int)
