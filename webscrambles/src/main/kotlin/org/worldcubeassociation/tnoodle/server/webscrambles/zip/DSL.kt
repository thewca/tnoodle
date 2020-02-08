package org.worldcubeassociation.tnoodle.server.webscrambles.zip

import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.File
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.Folder
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.ZipArchive
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.ZipNode

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
