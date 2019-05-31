package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.Document
import com.itextpdf.text.pdf.PdfReader
import com.itextpdf.text.pdf.PdfSmartCopy
import com.itextpdf.text.pdf.PdfWriter
import java.io.ByteArrayOutputStream

class MergedPdf(val toMerge: List<PdfContent>) : BasePdfSheet<PdfSmartCopy>(null) {
    override val document = Document()

    override fun Document.getWriter(bytes: ByteArrayOutputStream) = PdfSmartCopy(document, bytes)

    override fun PdfSmartCopy.writeContents() {
        for (content in toMerge) {
            val contentReader = PdfReader(content.render())

            for (pageN in 1..contentReader.numberOfPages) {
                val page = getImportedPage(contentReader, pageN)
                addPage(page)
            }
        }
    }
}
