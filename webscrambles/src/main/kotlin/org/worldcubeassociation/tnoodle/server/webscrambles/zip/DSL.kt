package org.worldcubeassociation.tnoodle.server.webscrambles.zip

class FolderBuilder {
    val contents = mutableListOf<ZipNode>()

    fun folder(name: String, builderFn: FolderBuilder.() -> Unit) {
        val builder = FolderBuilder().apply(builderFn)
        val folder = Folder(name, builder.contents)

        contents.add(folder)
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
