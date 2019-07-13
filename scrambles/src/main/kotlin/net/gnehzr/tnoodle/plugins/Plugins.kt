package net.gnehzr.tnoodle.plugins

import kotlin.properties.ReadOnlyProperty
import kotlin.reflect.KProperty

class Plugins<H> : ReadOnlyProperty<String, H> {
    override fun getValue(thisRef: String, property: KProperty<*>): H {
        return filePlugins.getValue(thisRef).value
    }

    private val filePlugins = mutableMapOf<String, Lazy<H>>()
    private val pluginComment = mutableMapOf<String, String>()

    val plugins
        get() = filePlugins.toMap()

    val comments
        get() = pluginComment.toMap()

    fun register(name: String, comment: String, builder: () -> H) {
        filePlugins[name] = lazy(builder)
        pluginComment[name] = comment
    }
}
