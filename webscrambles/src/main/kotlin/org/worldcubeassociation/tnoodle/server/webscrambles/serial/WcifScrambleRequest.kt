package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.FmcLanguagesExtension
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.MultiScrambleCountExtension

@Serializable
data class WcifScrambleRequest(
    val wcif: Competition,
    @SerialName("zip-password")
    val zipPassword: String? = null,
    @SerialName("pdf-password")
    val pdfPassword: String? = null,
    @SerialName("multi-cubes")
    val multiCubes: MultiScrambleCountExtension? = null,
    @SerialName("fmc-languages")
    val fmcLanguages: FmcLanguagesExtension? = null
)
