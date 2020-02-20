package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.webscrambles.plugins.FormatPlugins
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.ExtensionProvider

@Serializable
data class Round(val id: String, val format: String, val scrambleSetCount: Int, val scrambleSets: List<ScrambleSet> = emptyList(), override val extensions: List<Extension> = emptyList()): ExtensionProvider() {
    val idCode: ActivityCode
        get() = ActivityCode(id)

    val formatPlugin: FormatPlugins?
        get() = FormatPlugins.WCA_FORMATS[format]

    val expectedAttemptNum: Int
        get() = formatPlugin?.numSolves ?: 5
}
