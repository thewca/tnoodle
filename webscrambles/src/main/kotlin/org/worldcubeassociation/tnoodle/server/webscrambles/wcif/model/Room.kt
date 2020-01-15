package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

data class Room(val name: String, val activities: List<Activity>) : SafeNamed(name)
