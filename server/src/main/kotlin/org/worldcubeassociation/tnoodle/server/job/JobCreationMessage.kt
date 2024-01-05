package org.worldcubeassociation.tnoodle.server.job

import kotlinx.serialization.Serializable

@Serializable
data class JobCreationMessage(val id: Int, val targetStatus: Map<String, Int>)
