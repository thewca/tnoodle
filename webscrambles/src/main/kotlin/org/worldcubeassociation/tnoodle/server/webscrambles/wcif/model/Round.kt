package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable

@Serializable
data class Round(val id: String, val format: String, val scrambleSetCount: Int, val scrambleSets: List<ScrambleSet>) {
    val idCode: ActivityCode
        get() = ActivityCode(id)
}
