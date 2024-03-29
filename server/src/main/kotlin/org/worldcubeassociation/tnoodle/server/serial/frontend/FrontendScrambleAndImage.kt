package org.worldcubeassociation.tnoodle.server.serial.frontend

import kotlinx.serialization.Serializable

@Serializable
data class FrontendScrambleAndImage(
    val scramble: String,
    val svgImage: String
)
