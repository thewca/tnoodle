package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

data class Registration(val wcaRegistrationId: Int, val eventIds: List<String>, val status: RegistrationStatus)
