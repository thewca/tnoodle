package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable

@Serializable
data class Competition(val formatVersion: String, val id: String, val name: String, val shortName: String, val events: List<Event>, val schedule: Schedule)
