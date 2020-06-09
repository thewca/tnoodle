package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.Document
import com.itextpdf.text.pdf.PdfWriter
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import java.util.*

class FmcGenericSolutionSheet(scrambleSet: ScrambleSet, activityCode: ActivityCode, competitionTitle: String, locale: Locale) : FmcSolutionSheet(scrambleSet, activityCode, competitionTitle, locale, true) {
    override fun PdfWriter.writeContents(document: Document) {
        addFmcSolutionSheet(document, INDEX_SKIP_SCRAMBLE)
    }

    companion object {
        const val INDEX_SKIP_SCRAMBLE = -1
    }
}
