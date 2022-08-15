package org.worldcubeassociation.tnoodle.core.model.zip

abstract class AbstractNode(private val nodeName: String, private val nodeParent: Folder?) : ZipNode {
    override val path: String
        get() = nodeParent?.let { it.path + "/" }.orEmpty() + nodeName
}
