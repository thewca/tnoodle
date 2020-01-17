package org.worldcubeassociation.tnoodle.server.webscrambles.zip

import net.lingala.zip4j.io.outputstream.ZipOutputStream
import net.lingala.zip4j.model.ZipParameters
import net.lingala.zip4j.model.enums.CompressionLevel
import net.lingala.zip4j.model.enums.CompressionMethod
import net.lingala.zip4j.model.enums.EncryptionMethod
import java.io.ByteArrayOutputStream

class ZipArchive(val entries: List<ZipNode>) {
    val allFiles: List<File>
        get() = entries.filterIsInstance<File>() +
            entries.filterIsInstance<Folder>()
                .flatMap { it.allFiles }

    private var zippingCache: ByteArray? = null

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
