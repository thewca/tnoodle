package org.worldcubeassociation.tnoodle.server.serial.frontend

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.model.FormatData

@Serializable
data class FormatFrontendData(
    val id: String,
    val name: String,
    @SerialName("short_name") val shortName: String
) {
    companion object {
        fun fromDataModel(format: FormatData): FormatFrontendData {
            return FormatFrontendData(
                format.key,
                format.description,
                format.tag
            )
        }
    }
}
