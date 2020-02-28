package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

data class PersonalBest(val eventId: String, val best: AttemptResult, val type: ResultType, val worldRanking: Int, val continentalRanking: Int, val nationalRanking: Int)
