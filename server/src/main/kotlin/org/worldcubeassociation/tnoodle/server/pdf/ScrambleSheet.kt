package org.worldcubeassociation.tnoodle.server.pdf

import org.worldcubeassociation.tnoodle.core.model.Renderable
import org.worldcubeassociation.tnoodle.core.model.pdf.Document
import org.worldcubeassociation.tnoodle.core.model.pdf.SvgImage
import org.worldcubeassociation.tnoodle.core.model.pdf.dsl.CellBuilder
import org.worldcubeassociation.tnoodle.core.model.pdf.dsl.DocumentBuilder
import org.worldcubeassociation.tnoodle.core.model.pdf.dsl.document
import org.worldcubeassociation.tnoodle.core.model.wcif.ActivityCode
import org.worldcubeassociation.tnoodle.core.model.wcif.Scramble
import org.worldcubeassociation.tnoodle.server.exception.TranslationException
import org.worldcubeassociation.tnoodle.server.pdf.engine.IText7Engine
import org.worldcubeassociation.tnoodle.server.util.StringUtil.toColumnIndexString
import org.worldcubeassociation.tnoodle.server.util.Translate
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
    val renderable by lazy { Renderable(document, RENDERING_ENGINE) }

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
        return renderable.render(password)
    }

    abstract fun DocumentBuilder.writeContents()

    protected val scramblingPuzzle = activityCode.eventModel?.scrambler?.scrambler
        ?: error("Cannot draw PDF: Scrambler model for $activityCode not found")

    protected fun CellBuilder.svgScrambleImage(scramble: String, maxWidthPx: Int, maxHeightPx: Int = 0): SvgImage {
        val image = scramblingPuzzle.drawScramble(scramble, null)
        val fittingSize = scramblingPuzzle.getPreferredSize(maxWidthPx, maxHeightPx)

        return svgImage(image.toString(), fittingSize.width.toFloat(), fittingSize.height.toFloat())
    }

    companion object {
        val RENDERING_ENGINE = IText7Engine

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

        val PREFIX_TRANSLATION_KEYS = mapOf(
            ActivityCode.WCIF_PREFIX_ROUND to "round",
            ActivityCode.WCIF_PREFIX_GROUP to "scrambleSet",
            ActivityCode.WCIF_PREFIX_ATTEMPT to "attempt"
        )

        fun ActivityCode.compileTitleString(locale: Locale, includeEvent: Boolean = true, includeGroupId: Boolean = true): String {
            val parts = structureParts.mapNotNull { (k, v) ->
                getPrefixTranslation(locale, k, v).trim()
                    .takeUnless { k == ActivityCode.WCIF_PREFIX_GROUP && !includeGroupId }
            }.filter { it.isNotEmpty() }.joinToString(ActivityCode.TRANSLATION_DELIMITER)

            if (!includeEvent) {
                return parts
            }

            val prefix = eventModel?.description
            return "$prefix $parts"
        }

        private fun getPrefixTranslation(locale: Locale, prefix: Char, value: String): String {
            val prefixKey = PREFIX_TRANSLATION_KEYS[prefix]
                ?: TranslationException.error("Untranslatable ActivityCode prefix: $prefix")

            // TODO proper i18n via fmc.scrambleSet
            if (prefix == ActivityCode.WCIF_PREFIX_GROUP) {
                val convertedLetter = value.toIntOrNull()?.toColumnIndexString()
                return "Scramble Set $convertedLetter"
            }

            val translatedKey = Translate("fmc.$prefixKey", locale)
            return "$translatedKey $value"
        }
    }
}
