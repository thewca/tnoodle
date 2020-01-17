package org.worldcubeassociation.tnoodle.server.webscrambles.zip.model

abstract class AbstractNode(private val nodeName: String, private val nodeParent: Folder?) : ZipNode {
    override val path: String
        get() = nodeParent?.let { it.path + "/" }.orEmpty() + nodeName
}
