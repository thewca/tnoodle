package org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model

sealed class Element

sealed class ContainerElement<out T : Element>(val children: List<T>) : Element() {
    constructor(child: T) : this(listOf(child))

    val recursiveChildren get(): List<Element> = children.flatMap {
        if (it is ContainerElement<*>) it.recursiveChildren else listOf(it)
    }

    // minor hack that is necessary for font embedding into PDF files.
    fun exposeFontNames(): List<String> {
        return recursiveChildren.filterIsInstance<FontableElement>()
            .mapNotNull { it.fontName }.distinct()
    }
}
