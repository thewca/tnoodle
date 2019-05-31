package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.Document
import com.itextpdf.text.PageSize
import com.itextpdf.text.pdf.PdfWriter
import java.io.ByteArrayOutputStream

abstract class BasePdfSheet<W : PdfWriter>(val title: String?) : PdfContent {
    abstract val document: Document

    private var renderingCache: ByteArray? = null

    override fun render(password: String?): ByteArray {
        return renderingCache?.takeIf { password == null } ?: directRender(password)
    }

    private fun directRender(password: String?): ByteArray {
        val pdfBytes = ByteArrayOutputStream()
        val docWriter = this.document.getWriter(pdfBytes)

        if (password != null) {
            docWriter.setEncryption(password.toByteArray(), password.toByteArray(), PdfWriter.ALLOW_PRINTING, PdfWriter.STANDARD_ENCRYPTION_128)
        }

        document.open()
        docWriter.writeContents()
        document.close()

        return this.finalise(pdfBytes, password)
            .also { if (password == null) renderingCache = it }
    }

    abstract fun W.writeContents()

    abstract fun Document.getWriter(bytes: ByteArrayOutputStream): W

    open fun finalise(processedBytes: ByteArrayOutputStream, password: String?): ByteArray = processedBytes.toByteArray()

    companion object {
        val PAGE_SIZE = PageSize.LETTER
    }
}
