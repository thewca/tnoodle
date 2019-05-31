package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.pdf.PdfWriter
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import java.util.*

class FmcGenericSolutionSheet(request: ScrambleRequest, globalTitle: String?, locale: Locale) : FmcSolutionSheet(request, globalTitle, locale) {
    override fun PdfWriter.writeContents() {
        addFmcSolutionSheet(document, scrambleRequest, title, -1, locale)
    }
}
