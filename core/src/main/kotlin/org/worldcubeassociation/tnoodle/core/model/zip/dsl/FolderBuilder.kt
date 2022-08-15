package org.worldcubeassociation.tnoodle.core.model.zip.dsl

import org.worldcubeassociation.tnoodle.core.model.zip.File
import org.worldcubeassociation.tnoodle.core.model.zip.Folder
import org.worldcubeassociation.tnoodle.core.model.zip.ZipArchive
import org.worldcubeassociation.tnoodle.core.model.zip.ZipNode

class FolderBuilder {
    val contents = mutableListOf<ZipNode>()

    fun folder(name: String, builderFn: FolderBuilder.() -> Unit) {
        val builder = FolderBuilder().apply(builderFn)
        val folder = Folder(name, builder.contents)

        contents.add(folder)
    }

    fun folder(preFolder: Folder) {
        contents.add(preFolder)
    }

    fun file(name: String, content: String) {
        val file = File(name, content)
        contents.add(file)
    }

    fun file(name: String, content: ByteArray) {
        val file = File(name, content)
        contents.add(file)
    }
}

fun zipArchive(builderFn: FolderBuilder.() -> Unit): ZipArchive {
    val builder = FolderBuilder().apply(builderFn)
    return ZipArchive(builder.contents)
}

fun folder(name: String, builderFn: FolderBuilder.() -> Unit): Folder {
    val builder = FolderBuilder().apply(builderFn)
    return Folder(name, builder.contents)
}
