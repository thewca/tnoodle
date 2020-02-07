package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable

@Serializable
data class ScrambleSet(val id: Int, val scrambles: List<Scramble>, val extraScrambles: List<Scramble>)
