package org.worldcubeassociation.tnoodle.server.serial

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.serial.types.LocalDateTimeSerializer
import org.worldcubeassociation.tnoodle.server.wcif.model.Competition
import java.time.LocalDateTime

@Serializable
data class ZipInterchangeInfo(
    val competitionName: String?,
    val version: String,
    val generationDate: @Serializable(with = LocalDateTimeSerializer::class) LocalDateTime,
    val generationUrl: String?,
    val wcif: Competition
)
