package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.pdf.PdfWriter
import org.worldcubeassociation.tnoodle.server.webscrambles.ScrambleRequest
import java.util.*

class FmcGenericSolutionSheet(request: ScrambleRequest, globalTitle: String?, password: String?, locale: Locale) : FmcSolutionSheet(request, globalTitle, password, locale) {
    override fun PdfWriter.writeContents() {
        addFmcSolutionSheet(document, scrambleRequest, title, -1, locale)
    }
}
