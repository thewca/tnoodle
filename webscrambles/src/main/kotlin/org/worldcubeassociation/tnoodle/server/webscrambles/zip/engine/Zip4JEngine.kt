package org.worldcubeassociation.tnoodle.server.webscrambles.zip.engine

import net.lingala.zip4j.io.outputstream.ZipOutputStream
import net.lingala.zip4j.model.ZipParameters
import net.lingala.zip4j.model.enums.CompressionLevel
import net.lingala.zip4j.model.enums.CompressionMethod
import net.lingala.zip4j.model.enums.EncryptionMethod
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.model.ZipArchive
import org.worldcubeassociation.tnoodle.server.webscrambles.zip.util.StringUtil.stripDiacritics
import java.io.ByteArrayOutputStream

object Zip4JEngine {
    fun compress(zip: ZipArchive, password: String? = null): ByteArray {
        val baosZip = ByteArrayOutputStream()

        val zipOut = ZipOutputStream(baosZip, password?.toCharArray())

        val usePassword = password != null
        val parameters = defaultZipParameters(usePassword)

        for (file in zip.allFiles) {
            parameters.fileNameInZip = file.path.stripDiacritics()

            zipOut.putNextEntry(parameters)
            zipOut.write(file.content)

            zipOut.closeEntry()
        }

        zipOut.close()

        return baosZip.toByteArray()
    }

    private fun defaultZipParameters(useEncryption: Boolean = false) = ZipParameters().apply {
        compressionMethod = CompressionMethod.DEFLATE
        compressionLevel = CompressionLevel.NORMAL

        if (useEncryption) {
            isEncryptFiles = true
            encryptionMethod = EncryptionMethod.ZIP_STANDARD
        }
    }
}
