package org.worldcubeassociation.tnoodle.core.model.wcif

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.core.model.wcif.provider.SafeNameProvider

@Serializable
data class Room(val id: Int, override val name: String, val activities: List<Activity>) : SafeNameProvider
