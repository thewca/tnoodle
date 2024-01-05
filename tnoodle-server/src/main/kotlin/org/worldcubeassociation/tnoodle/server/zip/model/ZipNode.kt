package org.worldcubeassociation.tnoodle.server.zip.model

interface ZipNode {
    val path: String

    fun withParent(parent: Folder): ZipNode
}
