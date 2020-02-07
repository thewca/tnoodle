package org.worldcubeassociation.tnoodle.server.webscrambles.zip.model

import net.lingala.zip4j.io.outputstream.ZipOutputStream
import net.lingala.zip4j.model.ZipParameters
import net.lingala.zip4j.model.enums.CompressionLevel
import net.lingala.zip4j.model.enums.CompressionMethod
import net.lingala.zip4j.model.enums.EncryptionMethod
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.StringUtil.toFileSafeString
import java.io.ByteArrayOutputStream

class ZipArchive(private val entries: List<ZipNode>) {
    val allFiles: List<File>
        get() = Folder.flattenFiles(entries)

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

        private tailrec fun String.toUniqueTitle(seenTitles: Set<String>, suffixSalt: Int = 0): String {
            val suffixedTitle = "$this (${suffixSalt})"
                .takeUnless { suffixSalt == 0 } ?: this

            if (suffixedTitle !in seenTitles) {
                return suffixedTitle
            }

            return toUniqueTitle(seenTitles, suffixSalt + 1)
        }

        fun List<ScrambleRequest>.toUniqueTitles(): Map<String, ScrambleRequest> {
            return fold(emptyMap()) { acc, req ->
                val fileTitle = req.title.toFileSafeString()
                val safeTitle = fileTitle.toUniqueTitle(acc.keys)

                acc + (safeTitle to req)
            }
        }
    }
}
