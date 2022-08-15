package org.worldcubeassociation.tnoodle.server.serial

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.core.model.scramble.EventData
import org.worldcubeassociation.tnoodle.server.wcif.WCIFScrambleMatcher
import org.worldcubeassociation.tnoodle.core.model.wcif.Competition
import org.worldcubeassociation.tnoodle.core.model.wcif.extension.FmcLanguagesExtension
import org.worldcubeassociation.tnoodle.core.model.wcif.extension.MultiScrambleCountExtension
import org.worldcubeassociation.tnoodle.core.model.wcif.extension.TNoodleStatusExtension

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
