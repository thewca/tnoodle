package org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.extension

import kotlinx.serialization.Serializable

@Serializable
abstract class ExtensionProvider {
    abstract val extensions: List<Extension>

    fun withExtension(ext: Extension) =
        extensions.extend(ext)

    fun withExtensions(vararg ext: Extension): List<Extension> {
        return ext.fold(emptyList()) { acc, e -> acc.extend(e) }
    }

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
