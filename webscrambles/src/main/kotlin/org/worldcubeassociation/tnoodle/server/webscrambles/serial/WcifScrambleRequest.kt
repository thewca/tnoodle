package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFScrambleMatcher
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.FmcLanguagesExtension
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.MultiScrambleCountExtension
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.TNoodleStatusExtension

@Serializable
data class WcifScrambleRequest(
    val wcif: Competition,
    val zipPassword: String? = null,
    val pdfPassword: String? = null,
    val multiCubes: MultiScrambleCountExtension? = null,
    val fmcLanguages: FmcLanguagesExtension? = null,
    val frontendStatus: TNoodleStatusExtension? = null
) {
    val extendedWcif by lazy { compileExtendedWcif() }

    private fun compileExtendedWcif(): Competition {
        val optionalExtensions = listOfNotNull(
            multiCubes?.to(EventData.THREE_MULTI_BLD),
            fmcLanguages?.to(EventData.THREE_FM)
        ).toMap()

        val statusWcif = wcif.copy(extensions = wcif.withExtension(frontendStatus))
        return WCIFScrambleMatcher.installExtensions(statusWcif, optionalExtensions)
    }
}
