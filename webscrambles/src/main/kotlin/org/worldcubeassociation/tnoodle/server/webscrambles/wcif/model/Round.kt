package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.model.FormatData
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension.ExtensionProvider
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.provider.FormatIdProvider

@Serializable
data class Round(val id: String, val format: String, val scrambleSetCount: Int, val scrambleSets: List<ScrambleSet> = emptyList(), override val extensions: List<Extension> = emptyList()): ExtensionProvider(), FormatIdProvider {
    val idCode: ActivityCode
        get() = ActivityCode(id)

    override val formatId: String
        get() = format

    val expectedAttemptNum: Int
        get() = formatModel?.numSolves
            ?: FormatData.DEFAULT_FALLBACK_FORMAT.numSolves
}
