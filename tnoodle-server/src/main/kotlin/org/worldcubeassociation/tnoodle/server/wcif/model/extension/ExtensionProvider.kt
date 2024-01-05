package org.worldcubeassociation.tnoodle.server.wcif.model.extension

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.server.wcif.model.Extension

@Serializable
abstract class ExtensionProvider {
    abstract val extensions: List<Extension>

    fun withExtension(ext: ExtensionBuilder?) =
        ext?.let { extensions.extend(it) } ?: extensions

    fun withExtensions(ext: List<ExtensionBuilder?>) =
        ext.filterNotNull().fold(extensions) { acc, e -> acc.extend(e) }

    fun withExtensions(vararg ext: ExtensionBuilder) =
        withExtensions(ext.asList())

    inline fun <reified T : ExtensionBuilder> hasExtension() =
        findExtension<T>() != null

    inline fun <reified T : ExtensionBuilder> findExtension() =
        extensions.mapNotNull { it.parsedData<T>() }.singleOrNull()

    companion object {
        fun List<Extension>.extend(ext: ExtensionBuilder): List<Extension> {
            val index = indexOfFirst { it.id == ext.id }

            if (index == -1) {
                return this + ext.build()
            }

            return toMutableList()
                .apply { this[index] = ext.build() }
        }
    }
}
