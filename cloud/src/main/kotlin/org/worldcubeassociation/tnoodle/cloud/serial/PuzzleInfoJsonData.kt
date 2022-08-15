package org.worldcubeassociation.tnoodle.cloud.serial

import kotlinx.serialization.Serializable

@Serializable
data class PuzzleInfoJsonData(val shortName: String, val longName: String?, val initializationStatus: Double? = null, val cacheQueue: Int? = null)
