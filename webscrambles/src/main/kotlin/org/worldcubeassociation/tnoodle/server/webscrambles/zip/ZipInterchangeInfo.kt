package org.worldcubeassociation.tnoodle.server.webscrambles.zip

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.LocalDateTimeSerializer
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Schedule
import java.time.LocalDateTime

@Serializable
data class ZipInterchangeInfo(
    val sheets: List<ScrambleRequest>,
    val competitionName: String?,
    val version: String,
    @Serializable(with = LocalDateTimeSerializer::class) val generationDate: LocalDateTime,
    val generationUrl: String?,
    val schedule: Schedule?
)
