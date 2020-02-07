package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable

@Serializable
data class Room(override val name: String, val activities: List<Activity>) : SafeNamed()
