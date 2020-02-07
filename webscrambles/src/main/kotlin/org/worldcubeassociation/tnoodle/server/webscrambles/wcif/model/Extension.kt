package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model

import kotlinx.serialization.Serializable

@Serializable
abstract class Extension<T>(val id: String, val specUrl: String) {
    abstract val data: T
}
