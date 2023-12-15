package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import kotlinx.serialization.Serializable

@Serializable
data class FrontendScrambleAndImage(
    val scramble: String,
    val svgImage: String
)
