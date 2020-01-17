package org.worldcubeassociation.tnoodle.server.webscrambles.zip

data class File(val name: String, val content: ByteArray, val parent: Folder) : ZipNode {
    override val path: String
        get() = parent.path + "/" + name

    override fun withParent(parent: Folder) = copy(parent = parent)
}
