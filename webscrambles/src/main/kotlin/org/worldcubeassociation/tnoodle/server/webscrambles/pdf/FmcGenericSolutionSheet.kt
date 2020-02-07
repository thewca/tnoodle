package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.Document
import com.itextpdf.text.pdf.PdfWriter
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Activity
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Competition
import java.util.*

class FmcGenericSolutionSheet(wcif: Competition, activity: Activity, locale: Locale) : FmcSolutionSheet(wcif, activity, locale) {
    override fun PdfWriter.writeContents(document: Document) {
        addFmcSolutionSheet(document, title, -1, locale)
    }
}
