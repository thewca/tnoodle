package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.dsl.DocumentBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.dsl.PageBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Alignment
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Drawing
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Font
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Paper.inchesToPixel
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Paper.pixelsToInch
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import java.util.*

class FmcCutoutSheet(
    scramble: Scramble,
    totalAttemptsNum: Int,
    scrambleSetId: Int,
    competitionTitle: String,
    activityCode: ActivityCode,
    hasGroupId: Boolean,
    locale: Locale,
    watermark: String? = null
) : FewestMovesSheet(scramble, totalAttemptsNum, scrambleSetId, competitionTitle, activityCode, hasGroupId, locale, watermark) {
    override fun DocumentBuilder.writeContents() {
        page {
            setVerticalMargins(MARGIN_VERTICAL)
            setHorizontalMargins(MARGIN_HORIZONTAL)

            addFmcScrambleCutoutSheet()
        }
    }

    private fun PageBuilder.addFmcScrambleCutoutSheet() {
        val scrambleSuffix = scrambleXOfY
            .takeIf { totalAttemptsNum > 1 }.orEmpty()

        val title = "$activityTitle $scrambleSuffix".trim()

        val baseFont = Font.fontForLocale(Translate.DEFAULT_LOCALE)
        val localFont = Font.fontForLocale(locale)

        val actualWidthIn = availableWidthIn
        val actualHeightIn = availableHeightIn

        val scramblerPreferredSize = scramblingPuzzle.preferredSize
        val scramblerWidthToHeight = scramblerPreferredSize.width.toFloat() / scramblerPreferredSize.height

        table(2) {
            // see GeneralScrambleSheet to figure out what this is about (:
            val relativeHeight = actualHeightIn / actualWidthIn
            val relHeightPerScramble = relativeHeight / SCRAMBLES_PER_SHEET

            val scrambleWidth = relHeightPerScramble * scramblerWidthToHeight

            // as we're always printing more than 1 scramble per sheet,
            // naively assume that scrambleWidth < 1
            val textWidth = 1 - scrambleWidth
            relativeWidths = listOf(textWidth, scrambleWidth)

            border = Drawing.Border.ROWS_ONLY
            stroke = Drawing.Stroke.DASHED

            repeat(SCRAMBLES_PER_SHEET) {
                row {
                    verticalAlignment = Alignment.Vertical.MIDDLE

                    cell {
                        paragraph {
                            leading = LEFT_SIDE_LEADING

                            val paddingPenalty = paddingBackoff(padding).pixelsToInch / actualWidthIn

                            val scaledTextHeight = relHeightPerScramble - paddingPenalty
                            val scaledTextWidth = textWidth - paddingPenalty

                            optimalLine(competitionTitle, scaledTextHeight / LEFT_SIDE_SMALL_TEXT_RATIO, scaledTextWidth, actualWidthIn) {
                                fontName = baseFont
                            }
                            optimalLine(title, scaledTextHeight / LEFT_SIDE_LARGE_TEXT_RATIO, scaledTextWidth, actualWidthIn) {
                                fontName = localFont
                            }
                            optimalLine(scramble.scrambleString, scaledTextHeight / LEFT_SIDE_LARGE_TEXT_RATIO, scaledTextWidth, actualWidthIn) {
                                fontName = baseFont
                            }
                        }
                    }

                    cell {
                        padding = SCRAMBLE_IMAGE_PADDING
                        horizontalAlignment = Alignment.Horizontal.CENTER

                        val scrambleWidthPx = (scrambleWidth * actualWidthIn).inchesToPixel - paddingBackoff(SCRAMBLE_IMAGE_PADDING)
                        val scrambleHeightPx = (relHeightPerScramble * actualWidthIn).inchesToPixel - paddingBackoff(SCRAMBLE_IMAGE_PADDING)

                        svgScrambleImage(scramble.scrambleString, scrambleWidthPx, scrambleHeightPx)
                    }
                }
            }
        }
    }

    companion object {
        const val SCRAMBLES_PER_SHEET = 8

        const val MARGIN_HORIZONTAL = 20
        const val MARGIN_VERTICAL = 10

        const val SCRAMBLE_IMAGE_PADDING = 2 * Drawing.Padding.DEFAULT

        const val LEFT_SIDE_LEADING = 1.3f

        const val LEFT_SIDE_LARGE_TEXT_RATIO = 3
        const val LEFT_SIDE_SMALL_TEXT_RATIO = 8
    }
}
