package org.worldcubeassociation.tnoodle.server.serial

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ScramblingProgramInfo(val current: TNoodleVerisonInfo, val allowed: List<String>, val history: List<String>, @SerialName("running_version") val runningVersion: String? = null)

@Serializable
data class TNoodleVerisonInfo(val name: String, val information: String, val download: String)
