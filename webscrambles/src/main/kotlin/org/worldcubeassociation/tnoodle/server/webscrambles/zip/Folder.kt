package org.worldcubeassociation.tnoodle.server.webscrambles.zip

import net.lingala.zip4j.io.outputstream.ZipOutputStream
import net.lingala.zip4j.model.ZipParameters
import net.lingala.zip4j.model.enums.CompressionLevel
import net.lingala.zip4j.model.enums.CompressionMethod
import net.lingala.zip4j.model.enums.EncryptionMethod
import java.io.ByteArrayOutputStream

data class Folder(val name: String, private val rawChildren: List<ZipNode>, val parent: Folder? = null) : ZipNode {
    constructor(name: String, parent: Folder?) : this(name, emptyList(), parent)

    val children = rawChildren.map { it.withParent(this) }

    override val path: String
        get() = parent?.let { it.path + "/" }.orEmpty() + name

    override fun withParent(parent: Folder) = copy(parent = parent)

    val files: List<File>
        get() = children.filterIsInstance<File>()

    val allFiles: List<File>
        get() = files + children.filterIsInstance<Folder>()
            .flatMap { it.allFiles }

    private var zippingCache: ByteArray? = null

    operator fun div(childName: String) = Folder(childName, this)

    operator fun plus(child: ZipNode) = copy(rawChildren = children + child)
    operator fun plus(moreChildren: List<ZipNode>) = copy(rawChildren = children + moreChildren)

    fun compress(password: String? = null): ByteArray {
        return zippingCache?.takeIf { password == null } ?: directCompress(password)
    }

    fun directCompress(password: String?): ByteArray {
        val baosZip = ByteArrayOutputStream()

        val zipOut = password?.let { ZipOutputStream(baosZip, it.toCharArray()) }
            ?: ZipOutputStream(baosZip)

        val usePassword = password != null
        val parameters = defaultZipParameters(usePassword)

        for (file in allFiles) {
            parameters.fileNameInZip = file.path

            zipOut.putNextEntry(parameters)
            zipOut.write(file.content)

            zipOut.closeEntry()
        }

        zipOut.close()

        return baosZip.toByteArray()
            .also { if (password == null) zippingCache = it }
    }

    companion object {
        private fun defaultZipParameters(useEncryption: Boolean = false) = ZipParameters().apply {
            compressionMethod = CompressionMethod.DEFLATE
            compressionLevel = CompressionLevel.NORMAL

            if (useEncryption) {
                isEncryptFiles = true
                encryptionMethod = EncryptionMethod.ZIP_STANDARD
            }
        }
    }
}
