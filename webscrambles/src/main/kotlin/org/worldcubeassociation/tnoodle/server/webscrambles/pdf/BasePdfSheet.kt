package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.Document
import com.itextpdf.text.PageSize
import com.itextpdf.text.pdf.PdfWriter
import java.io.ByteArrayOutputStream

abstract class BasePdfSheet<W : PdfWriter>(val title: String?) : PdfContent {
    open fun openDocument() = Document()

    private var renderingCache: ByteArray? = null

    override fun render(password: String?): ByteArray {
        return renderingCache?.takeIf { password == null } ?: directRender(password)
    }

    private fun directRender(password: String?): ByteArray {
        val pdfBytes = ByteArrayOutputStream()
        val pdfDocument = openDocument()

        val docWriter = pdfDocument.getWriter(pdfBytes)

        if (password != null) {
            docWriter.setEncryption(password.toByteArray(), password.toByteArray(), PdfWriter.ALLOW_PRINTING, PdfWriter.STANDARD_ENCRYPTION_128)
        }

        pdfDocument.open()
        docWriter.writeContents(pdfDocument)
        pdfDocument.close()

        return this.finalise(pdfBytes, password)
            .also { if (password == null) renderingCache = it }
    }

    abstract fun W.writeContents(document: Document)

    abstract fun Document.getWriter(bytes: ByteArrayOutputStream): W

    open fun finalise(processedBytes: ByteArrayOutputStream, password: String?): ByteArray = processedBytes.toByteArray()

    companion object {
        val PAGE_SIZE = PageSize.LETTER
    }
}
