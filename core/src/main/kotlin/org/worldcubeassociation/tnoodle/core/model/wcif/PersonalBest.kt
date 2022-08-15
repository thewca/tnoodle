package org.worldcubeassociation.tnoodle.core.model.wcif

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.core.model.wcif.provider.EventIdProvider

@Serializable
data class PersonalBest(
    override val eventId: String,
    val best: @Serializable(with = AttemptResult.Companion::class) AttemptResult,
    val type: @Serializable(with = ResultType.Companion::class) ResultType,
    val worldRanking: Int,
    val continentalRanking: Int,
    val nationalRanking: Int
) : EventIdProvider
