package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.Document
import com.itextpdf.text.pdf.PdfWriter
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import java.util.*

class FmcGenericSolutionSheet(scrambleSet: ScrambleSet, activityCode: ActivityCode, locale: Locale) : FmcSolutionSheet(scrambleSet, activityCode, locale) {
    override fun PdfWriter.writeContents(document: Document) {
        addFmcSolutionSheet(document, title, -1, locale)
    }
}
