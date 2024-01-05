package org.worldcubeassociation.tnoodle.server.serial

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.wcif.model.Competition

@Serializable
data class WcifScrambleRequest(
    val wcif: Competition,
    val zipPassword: String? = null,
    val pdfPassword: String? = null,
)
