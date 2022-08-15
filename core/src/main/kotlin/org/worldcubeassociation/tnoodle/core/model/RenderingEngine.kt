package org.worldcubeassociation.tnoodle.core.model

fun interface RenderingEngine<T> {
    fun render(content: T, password: String?): ByteArray
}
