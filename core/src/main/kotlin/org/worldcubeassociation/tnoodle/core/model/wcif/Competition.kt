package org.worldcubeassociation.tnoodle.core.model.wcif

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.core.model.wcif.extension.ExtensionProvider

@Serializable
data class Competition(
    val formatVersion: String,
    val id: String,
    val name: String,
    val shortName: String,
    val persons: List<Person>,
    val events: List<Event>,
    val schedule: Schedule,
    override val extensions: List<Extension> = emptyList()
) : ExtensionProvider()
