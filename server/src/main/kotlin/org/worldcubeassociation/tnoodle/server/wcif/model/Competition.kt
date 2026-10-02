package org.worldcubeassociation.tnoodle.server.wcif.model

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.wcif.model.extension.ExtensionProvider

@Serializable
data class Competition(
    val formatVersion: String = FORMAT_VERSION,
    val id: String,
    val name: String,
    val shortName: String,
    val persons: List<Person>,
    val events: List<Event>,
    val schedule: Schedule,
    override val extensions: List<Extension> = emptyList()
) : ExtensionProvider() {
    companion object {
        const val FORMAT_VERSION = "2.2.0"
    }
}
