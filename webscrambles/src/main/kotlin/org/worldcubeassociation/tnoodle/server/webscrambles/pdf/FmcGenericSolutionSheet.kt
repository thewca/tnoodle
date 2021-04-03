package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import com.itextpdf.text.Document
import com.itextpdf.text.pdf.PdfWriter
import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import java.util.*

class FmcGenericSolutionSheet(competitionTitle: String, locale: Locale) : FmcSolutionSheet(ScrambleSet.empty(), PSEUDO_ACTIVITY_CODE, competitionTitle, locale, true) {
    override fun PdfWriter.writeContents(document: Document) {
        addFmcSolutionSheet(document, INDEX_SKIP_SCRAMBLE)
    }

    companion object {
        const val INDEX_SKIP_SCRAMBLE = -1

        val PSEUDO_ACTIVITY_CODE = ActivityCode.compile(EventData.THREE_FM, 0, 0, 0)
    }
}
