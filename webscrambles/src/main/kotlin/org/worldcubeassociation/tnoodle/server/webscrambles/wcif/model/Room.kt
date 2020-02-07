package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable

@Serializable
data class Room(val name: String, val activities: List<Activity>) : SafeNamed(name)
