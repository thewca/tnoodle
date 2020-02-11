package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.Document
import com.itextpdf.text.pdf.*
import java.io.ByteArrayOutputStream

class MergedPdfWithOutline(val toMerge: List<PdfContent>, val configuration: List<Triple<String, String, Int>>) : BasePdfSheet<PdfSmartCopy>() {
    override fun Document.getWriter(bytes: ByteArrayOutputStream): PdfSmartCopy = PdfSmartCopy(this, bytes)

    override fun PdfSmartCopy.writeContents(document: Document) {
        val root = directContent.rootOutline

        val outlineByPuzzle = mutableMapOf<String, PdfOutline>()

        var pages = 1

        for ((origPdf, configData) in toMerge.zip(configuration)) {
            val (title, group, copies) = configData

            val d = PdfDestination(PdfDestination.FIT)
            val action = PdfAction.gotoLocalPage(pages, d, this)

            val puzzleLink: PdfOutline = outlineByPuzzle.getOrPut(group) {
                PdfOutline(root, action, group, false)
            }

            // Yes, invoking the constructor is enough to *add* the outline to the document.
            // We should REALLY get rid of itext5.
            PdfOutline(puzzleLink, action, title)

            val pdfReader = PdfReader(origPdf.render())

            repeat(copies) {
                for (pageN in 1..pdfReader.numberOfPages) {
                    val page = getImportedPage(pdfReader, pageN)
                    addPage(page)

                    pages++
                }
            }
        }
    }
}
