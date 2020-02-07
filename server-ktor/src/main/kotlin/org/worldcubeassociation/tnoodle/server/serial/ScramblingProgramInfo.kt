package org.worldcubeassociation.tnoodle.server.serial

import kotlinx.serialization.Serializable

@Serializable
data class ScramblingProgramInfo(val current: TNoodleVerisonInfo, val allowed: List<String>, val history: List<String>, val running_version: String? = null)

@Serializable
data class TNoodleVerisonInfo(val name: String, val information: String, val download: String)
