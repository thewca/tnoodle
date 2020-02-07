package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import kotlinx.serialization.Serializable

@Serializable
data class PuzzleInfoJsonData(val shortName: String, val longName: String?, val initializationStatus: Double? = null)
