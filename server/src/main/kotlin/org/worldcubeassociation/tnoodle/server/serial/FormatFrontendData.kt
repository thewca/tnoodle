package org.worldcubeassociation.tnoodle.server.serial

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.core.model.scramble.FormatData

@Serializable
data class FormatFrontendData(
    val name: String,
    val shortName: String
) {
    companion object {
        fun fromDataModel(format: FormatData): FormatFrontendData {
            return FormatFrontendData(
                format.description,
                format.tag
            )
        }
    }
}
