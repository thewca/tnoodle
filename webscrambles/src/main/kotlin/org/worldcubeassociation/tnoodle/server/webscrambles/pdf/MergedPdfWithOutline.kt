package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.Document
import com.itextpdf.text.pdf.*
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.OutlineConfiguration
import java.io.ByteArrayOutputStream

class MergedPdfWithOutline(val toMerge: List<PdfContent>, val configuration: List<OutlineConfiguration>) : BasePdfSheet<PdfSmartCopy>() {
    override fun Document.getWriter(bytes: ByteArrayOutputStream): PdfSmartCopy = PdfSmartCopy(this, bytes)

    override fun PdfSmartCopy.writeContents(document: Document) {
        val root = directContent.rootOutline
        val outlineByPuzzle = mutableMapOf<String, PdfOutline>()

        for ((origPdf, config) in toMerge.zip(configuration)) {
            val action = PdfAction.gotoLocalPage(currentPageNumber, DESTINATION, this)

            val puzzleLink: PdfOutline = outlineByPuzzle.getOrPut(config.group) {
                PdfOutline(root, action, config.group, false)
            }

            // Yes, invoking the constructor is enough to *add* the outline to the document.
            // We should REALLY get rid of itext5.
            PdfOutline(puzzleLink, action, config.title)

            val pdfReader = PdfReader(origPdf.render())

            repeat(config.copies) {
                for (pageN in 1..pdfReader.numberOfPages) {
                    val page = getImportedPage(pdfReader, pageN)
                    addPage(page)
                }
            }
        }
    }

    companion object {
        private val DESTINATION = PdfDestination(PdfDestination.FIT)
    }
}
