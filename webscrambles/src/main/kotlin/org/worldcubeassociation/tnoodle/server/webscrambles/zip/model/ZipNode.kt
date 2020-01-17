package org.worldcubeassociation.tnoodle.server.webscrambles.zip.model

interface ZipNode {
    val path: String

    fun withParent(parent: Folder): ZipNode
}
