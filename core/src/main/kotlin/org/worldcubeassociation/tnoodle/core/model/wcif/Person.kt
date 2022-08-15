package org.worldcubeassociation.tnoodle.core.model.wcif

import kotlinx.serialization.Serializable

@Serializable
data class Person(
    val registrantId: Int?,
    val name: String,
    val wcaUserId: Int,
    val wcaId: String?,
    val countryIso2: @Serializable(with = CountryCode.Companion::class) CountryCode,
    val gender: @Serializable(with = Gender.Companion::class) Gender,
    val avatar: Avatar?,
    val roles: List<@Serializable(with = Role.Companion::class) Role> = emptyList(),
    val registration: Registration? = null,
    val assignments: List<Assignment> = emptyList(),
    val personalBests: List<PersonalBest> = emptyList()
)
