package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.Document
import com.itextpdf.text.pdf.PdfReader
import com.itextpdf.text.pdf.PdfSmartCopy
import java.io.ByteArrayOutputStream

class MergedPdf(val toMerge: List<ByteArray>) : BasePdfSheet<PdfSmartCopy>() {
    override fun Document.getWriter(bytes: ByteArrayOutputStream) = PdfSmartCopy(this, bytes)

    override fun PdfSmartCopy.writeContents(document: Document) {
        for (content in toMerge) {
            val contentReader = PdfReader(content)

            for (pageN in 1..contentReader.numberOfPages) {
                val page = getImportedPage(contentReader, pageN)
                addPage(page)
            }
        }
    }
}
