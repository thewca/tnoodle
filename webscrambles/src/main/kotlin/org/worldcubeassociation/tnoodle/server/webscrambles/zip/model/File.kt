package org.worldcubeassociation.tnoodle.server.webscrambles.zip.model

data class File(val name: String, val content: ByteArray, val parent: Folder? = null) : ZipNode {
    constructor(name: String, content: String, parent: Folder? = null) : this(name, content.toByteArray(), parent)

    override val path: String
        get() = parent?.let { it.path + "/" }.orEmpty() + name

    override fun withParent(parent: Folder) = copy(parent = parent)
}
