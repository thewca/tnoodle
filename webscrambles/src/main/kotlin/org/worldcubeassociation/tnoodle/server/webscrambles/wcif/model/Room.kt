package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Activity
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.SafeNamed

data class Room(val name: String, val activities: List<Activity>) : SafeNamed(name)
