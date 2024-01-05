package org.worldcubeassociation.tnoodle.server.wcif.model

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.wcif.model.extension.ExtensionProvider
import org.worldcubeassociation.tnoodle.server.wcif.provider.EventIdProvider

@Serializable
data class Event(
    val id: String,
    val rounds: List<Round>,
    override val extensions: List<Extension> = emptyList()
) : ExtensionProvider(), EventIdProvider {
    override val eventId: String
        get() = id
}
