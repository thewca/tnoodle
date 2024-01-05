package org.worldcubeassociation.tnoodle.server.zip.model

data class File(val name: String, val content: ByteArray, val parent: Folder? = null) : AbstractNode(name, parent) {
    constructor(name: String, content: String, parent: Folder? = null) : this(name, content.toByteArray(), parent)

    override fun withParent(parent: Folder) = copy(parent = parent)
}
