package org.worldcubeassociation.tnoodle.server.webscrambles.zip

interface ZipNode {
    val path: String

    fun withParent(parent: Folder): ZipNode
}
