package org.worldcubeassociation.tnoodle.core.model.wcif

import kotlinx.serialization.Serializable

@Serializable
data class Assignment(
    val activityId: Int,
    val assignmentCode: @Serializable(with = AssignmentCode.Companion::class) AssignmentCode,
    val stationNumber: Int?
)
