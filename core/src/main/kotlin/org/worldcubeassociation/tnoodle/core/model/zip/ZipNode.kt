package org.worldcubeassociation.tnoodle.core.model.zip

interface ZipNode {
    val path: String

    fun withParent(parent: Folder): ZipNode
}
