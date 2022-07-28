package org.worldcubeassociation.tnoodle.server.webscrambles.nupdf

import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.Document
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.SvgImage
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.dsl.CellBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.dsl.DocumentBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.dsl.document
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.ActivityCode
import java.util.*

abstract class BaseScrambleNuSheet(
    val competitionTitle: String,
    val activityCode: ActivityCode,
    val hasGroupId: Boolean,
    val locale: Locale
) {
    fun compile(): Document {
        return document {
            title = activityCode.compileTitleString(locale)

            writeContents()
        }
    }

    abstract fun DocumentBuilder.writeContents()

    protected val scramblingPuzzle = activityCode.eventModel?.scrambler?.scrambler
        ?: error("Cannot draw PDF: Scrambler model for $activityCode not found")

    protected fun CellBuilder.svgScrambleImage(scramble: String, maxWidthPx: Int): SvgImage {
        val image = scramblingPuzzle.drawScramble(scramble, null)
        val fittingSize = scramblingPuzzle.getPreferredSize(maxWidthPx, 0)

        return svgImage(image) {
            size = fittingSize
        }
    }
}
