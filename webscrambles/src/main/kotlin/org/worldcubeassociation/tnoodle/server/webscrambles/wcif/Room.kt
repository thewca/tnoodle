package org.worldcubeassociation.tnoodle.server.webscrambles.wcif

data class Room(val name: String, val activities: List<Activity>) : SafeNamed(name)
