package org.worldcubeassociation.tnoodle.server.webscrambles.zip

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.LocalDateTimeSerializer
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import java.time.LocalDateTime

@Serializable
data class ZipInterchangeInfo(
    val competitionName: String?,
    val version: String,
    @Serializable(with = LocalDateTimeSerializer::class) val generationDate: LocalDateTime,
    val generationUrl: String?,
    val wcif: Competition
)
