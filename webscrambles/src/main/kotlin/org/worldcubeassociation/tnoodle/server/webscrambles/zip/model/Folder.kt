package org.worldcubeassociation.tnoodle.server.webscrambles.zip.model

data class Folder(val name: String, private val rawChildren: List<ZipNode>, val parent: Folder? = null) : AbstractNode(name, parent) {
    constructor(name: String, parent: Folder? = null) : this(name, emptyList(), parent)

    val children = rawChildren.map { it.withParent(this) }

    override fun withParent(parent: Folder) = copy(parent = parent)

    val allFiles: List<File>
        get() = flattenFiles(children)

    operator fun div(childName: String) = Folder(childName, this)

    operator fun plus(child: ZipNode) = copy(rawChildren = children + child)
    operator fun plus(moreChildren: List<ZipNode>) = copy(rawChildren = children + moreChildren)

    companion object {
        fun flattenFiles(nodes: List<ZipNode>): List<File> {
            return nodes.flatMap {
                when (it) {
                    is File -> listOf(it)
                    is Folder -> it.allFiles
                    else -> listOf()
                }
            }
        }
    }
}
