package org.worldcubeassociation.tnoodle.core.model.wcif

import kotlinx.serialization.Serializable

@Serializable
data class Registration(
    val wcaRegistrationId: Int,
    val eventIds: List<String>,
    val status: @Serializable(with = RegistrationStatus.Companion::class) RegistrationStatus
)
