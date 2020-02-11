package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension

import kotlinx.serialization.Serializable

@Serializable
abstract class ExtensionProvider {
    abstract val extensions: List<Extension>

    fun withExtension(ext: Extension?) =
        ext?.let { extensions.extend(it) } ?: extensions

    fun withExtensions(vararg ext: Extension): List<Extension> {
        return ext.fold(extensions) { acc, e -> acc.extend(e) }
    }

    fun withExtensions(ext: List<Extension?>) =
        withExtensions(*ext.filterNotNull().toTypedArray())

    inline fun <reified T : Extension> hasExtension() =
        findExtension<T>() != null

    inline fun <reified T : Extension> findExtension() =
        extensions.filterIsInstance<T>().singleOrNull()

    companion object {
        fun List<Extension>.extend(ext: Extension): List<Extension> {
            val index = indexOfFirst { it.id == ext.id }

            if (index == -1) {
                return this + ext
            }

            return toMutableList()
                .apply { this[index] = ext }
        }
    }
}
