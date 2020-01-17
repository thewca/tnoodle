package org.worldcubeassociation.tnoodle.server.webscrambles.zip.model

data class Folder(val name: String, private val rawChildren: List<ZipNode>, val parent: Folder? = null) : AbstractNode(name, parent) {
    constructor(name: String, parent: Folder? = null) : this(name, emptyList(), parent)

    val children = rawChildren.map { it.withParent(this) }

    override fun withParent(parent: Folder) = copy(parent = parent)

    val files: List<File>
        get() = children.filterIsInstance<File>()

    val allFiles: List<File>
        get() = files + children.filterIsInstance<Folder>()
            .flatMap { it.allFiles }

    operator fun div(childName: String) = Folder(childName, this)

    operator fun plus(child: ZipNode) = copy(rawChildren = children + child)
    operator fun plus(moreChildren: List<ZipNode>) = copy(rawChildren = children + moreChildren)
}
