package org.worldcubeassociation.tnoodle.core.model

data class Renderable<T>(
    val content: T,
    val engine: RenderingEngine<T>
) {
    private val renderingCache by lazy { directRender(null) }

    fun render(password: String? = null): ByteArray {
        if (password == null)
            return renderingCache

        return directRender(password)
    }

    private fun directRender(password: String? = null): ByteArray {
        return engine.render(content, password)
    }
}
