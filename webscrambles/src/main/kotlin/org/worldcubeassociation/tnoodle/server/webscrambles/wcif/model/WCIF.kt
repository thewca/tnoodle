package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable

@Serializable
data class WCIF(val events: List<Event>, val schedule: Schedule)
