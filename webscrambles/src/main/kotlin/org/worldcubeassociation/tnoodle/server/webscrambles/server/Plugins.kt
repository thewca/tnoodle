package org.worldcubeassociation.tnoodle.server.webscrambles.server

import net.gnehzr.tnoodle.scrambles.Puzzle
import net.gnehzr.tnoodle.scrambles.ScrambleCacher
import kotlin.properties.ReadOnlyProperty
import kotlin.reflect.KProperty

class Plugins<P : Puzzle> : ReadOnlyProperty<String, P> {
    override fun getValue(thisRef: String, property: KProperty<*>): P {
        return filePlugins.getValue(thisRef).value
    }

    private val filePlugins = mutableMapOf<String, Lazy<P>>()
    private val pluginComment = mutableMapOf<String, String>()
    private val extraCachers = mutableMapOf<String, ScrambleCacher>()

    val plugins: Map<String, Lazy<P>>
        get() = filePlugins

    val comments: Map<String, String>
        get() = pluginComment

    val cachers: Map<String, ScrambleCacher>
        get() = extraCachers

    fun register(name: String, comment: String, builder: () -> P) {
        filePlugins[name] = lazy {
            builder().also { extraCachers[name] = ScrambleCacher(it, CACHE_SIZE, false) }
        }

        pluginComment[name] = comment
    }

    companion object {
        const val CACHE_SIZE = 30
    }
}
