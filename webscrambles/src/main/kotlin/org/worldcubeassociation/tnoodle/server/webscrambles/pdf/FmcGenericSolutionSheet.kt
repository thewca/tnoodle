package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.Document
import com.itextpdf.text.pdf.PdfWriter
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import java.util.*

class FmcGenericSolutionSheet(scrambleSet: ScrambleSet, activityCode: ActivityCode, competitionTitle: String, locale: Locale) : FmcSolutionSheet(scrambleSet, activityCode, competitionTitle, locale) {
    override fun PdfWriter.writeContents(document: Document) {
        addFmcSolutionSheet(document, -1, locale)
    }
}
