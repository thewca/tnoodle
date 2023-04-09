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
        // fitting stuff into padded boxes doesn't work the way I thought it would.
        fun paddingBackoff(padding: Int): Int {
            // `2 * padding` is the intuitive part. (horizontal: left AND right, vertical: top AND bottom)
            // However, both text lines and also images seem to struggle with fitting *exactly* inside the padded box.
            // Both need an additional backoff of at least 1px per direction.
            //
            // As of writing this comment, it is unclear whether this is due to human error on my part
            // or an actual quirk in the iText 7 layout. Signed GB 2022-Aug-02
            return 2 * padding + 2
        }
    }
}
