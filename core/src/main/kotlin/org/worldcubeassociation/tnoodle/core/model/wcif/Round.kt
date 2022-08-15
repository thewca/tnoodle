package org.worldcubeassociation.tnoodle.core.model.wcif

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.core.model.scramble.FormatData
import org.worldcubeassociation.tnoodle.core.model.wcif.extension.ExtensionProvider
import org.worldcubeassociation.tnoodle.core.model.wcif.provider.FormatIdProvider

@Serializable
data class Round(
    val id: String,
    val format: String,
    val scrambleSetCount: Int,
    val scrambleSets: List<ScrambleSet> = emptyList(),
    override val extensions: List<Extension> = emptyList()
) : ExtensionProvider(), FormatIdProvider {
    val idCode: ActivityCode
        get() = ActivityCode(id)

    override val formatId: String
        get() = format

    val expectedAttemptNum: Int
        get() = formatModel?.numSolves
            ?: FormatData.DEFAULT_FALLBACK_FORMAT.numSolves
}
