package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.Document
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.SvgImage
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.dsl.CellBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.dsl.DocumentBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.dsl.document
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.ActivityCode
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.Scramble
import java.util.*

abstract class ScrambleSheet(
    val competitionTitle: String,
    val activityCode: ActivityCode,
    val hasGroupId: Boolean,
    val locale: Locale,
    val watermark: String? = null
) {
    abstract val scrambles: List<Scramble>
    abstract val scrambleSetId: Int // the scramble set this sheet refers to

    val document by lazy { compile() }

    val title get() = activityCode.compileTitleString(locale)

    private fun compile(): Document {
        return document {
            title = this@ScrambleSheet.title
            watermark = this@ScrambleSheet.watermark

            outlineGroup = listOfNotNull(activityCode.eventModel?.description)

            writeContents()
        }
    }

    fun render(password: String? = null): ByteArray {
        return document.render(password)
    }

    abstract fun DocumentBuilder.writeContents()

    protected val scramblingPuzzle = activityCode.eventModel?.scrambler?.scrambler
        ?: error("Cannot draw PDF: Scrambler model for $activityCode not found")

    protected fun CellBuilder.svgScrambleImage(scramble: String, maxWidthPx: Int, maxHeightPx: Int = 0): SvgImage {
        val image = scramblingPuzzle.drawScramble(scramble, null)
        val fittingSize = scramblingPuzzle.getPreferredSize(maxWidthPx, maxHeightPx)

        return svgImage(image) {
            size = fittingSize
        }
    }

    companion object {
        val RENDERING_ENGINE = Document.DEFAULT_ENGINE
    }
}
