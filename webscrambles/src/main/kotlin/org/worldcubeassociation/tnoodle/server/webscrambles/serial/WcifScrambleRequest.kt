package org.worldcubeassociation.tnoodle.server.webscrambles.serial

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.webscrambles.plugins.EventPlugins
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFScrambleMatcher
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.FmcLanguagesExtension
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.MultiScrambleCountExtension
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.StagingFlagExtension

@Serializable
data class WcifScrambleRequest(
    val wcif: Competition,
    val zipPassword: String? = null,
    val pdfPassword: String? = null,
    val multiCubes: MultiScrambleCountExtension? = null,
    val fmcLanguages: FmcLanguagesExtension? = null,
    val isStaging: StagingFlagExtension? = null
) {
    val extendedWcif by lazy { compileExtendedWcif() }

    private fun compileExtendedWcif(): Competition {
        val optionalExtensions = listOfNotNull(
            multiCubes?.to(EventPlugins.THREE_MULTI_BLD),
            fmcLanguages?.to(EventPlugins.THREE_FM)
        ).toMap()

        val stagedWcif = wcif.copy(extensions = wcif.withExtension(isStaging))
        return WCIFScrambleMatcher.installExtensions(stagedWcif, optionalExtensions)
    }
}
