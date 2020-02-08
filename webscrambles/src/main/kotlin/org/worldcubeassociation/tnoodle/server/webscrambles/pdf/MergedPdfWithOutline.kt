package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.Document
import com.itextpdf.text.pdf.*
import java.io.ByteArrayOutputStream

class MergedPdfWithOutline(val toMerge: List<PdfContent>, val configuration: List<Triple<String, String, Int>>, globalTitle: String?) : BasePdfSheet<PdfSmartCopy>() {
    override fun Document.getWriter(bytes: ByteArrayOutputStream): PdfSmartCopy = PdfSmartCopy(this, bytes)

    override fun PdfSmartCopy.writeContents(document: Document) {
        val root = directContent.rootOutline

        val outlineByPuzzle = mutableMapOf<String, PdfOutline>()
        val expandPuzzleLinks = false

        var pages = 1

        for ((origPdf, configData) in toMerge.zip(configuration)) {
            val (title, group, copies) = configData

            val puzzleLink: PdfOutline = outlineByPuzzle.getOrPut(group) {
                val d = PdfDestination(PdfDestination.FIT)

                PdfOutline(root,
                    PdfAction.gotoLocalPage(pages, d, this), group, expandPuzzleLinks)
            }

            val d = PdfDestination(PdfDestination.FIT)

            PdfOutline(puzzleLink,
                PdfAction.gotoLocalPage(pages, d, this), title)

            val pdfReader = PdfReader(origPdf.render())

            for (j in 0 until copies) {
                for (pageN in 1..pdfReader.numberOfPages) {
                    val page = getImportedPage(pdfReader, pageN)
                    addPage(page)

                    pages++
                }
            }
        }
    }
}
