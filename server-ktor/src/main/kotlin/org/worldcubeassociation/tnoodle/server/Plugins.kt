package org.worldcubeassociation.tnoodle.server

class Plugins<H> {
    private val filePlugins = mutableMapOf<String, H>()
    private val pluginComment = mutableMapOf<String, String>()

    val plugins
        get() = filePlugins.toMap()

    val comments
        get() = pluginComment.toMap()

    fun register(name: String, comment: String, builder: () -> H) {
        val cachedInstance by lazy(builder)

        filePlugins[name] = cachedInstance
        pluginComment[name] = comment
    }
}
