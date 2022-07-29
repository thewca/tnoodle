package org.worldcubeassociation.tnoodle.server.webscrambles.zip.model

import org.worldcubeassociation.tnoodle.server.webscrambles.zip.engine.Zip4JEngine

class ZipArchive(private val entries: List<ZipNode>) {
    val allFiles: List<File>
        get() = Folder.flattenFiles(entries)

    private val zippingCache by lazy { directCompress(null) }

    fun compress(password: String? = null): ByteArray {
        if (password == null) {
            return zippingCache
        }

        return directCompress(password)
    }

    fun directCompress(password: String?): ByteArray {
        return Zip4JEngine.compress(this, password)
    }
}
