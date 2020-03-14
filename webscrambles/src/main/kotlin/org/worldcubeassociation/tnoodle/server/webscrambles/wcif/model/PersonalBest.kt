package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable

@Serializable
data class PersonalBest(val eventId: String, val best: @Serializable(with = AttemptResult.Companion::class) AttemptResult, val type: @Serializable(with = ResultType.Companion::class) ResultType, val worldRanking: Int, val continentalRanking: Int, val nationalRanking: Int)
