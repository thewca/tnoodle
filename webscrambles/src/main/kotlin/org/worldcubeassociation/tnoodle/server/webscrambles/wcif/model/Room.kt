package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.provider.SafeNameProvider

@Serializable
data class Room(val id: Int, override val name: String, val activities: List<Activity>) : SafeNameProvider
