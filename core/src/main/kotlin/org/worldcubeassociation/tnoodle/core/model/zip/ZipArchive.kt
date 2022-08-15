package org.worldcubeassociation.tnoodle.core.model.zip

data class ZipArchive(private val entries: List<ZipNode>) {
    val allFiles: List<File>
        get() = Folder.flattenFiles(entries)
}
