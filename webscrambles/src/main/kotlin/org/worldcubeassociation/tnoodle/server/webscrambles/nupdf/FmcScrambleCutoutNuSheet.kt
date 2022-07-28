package org.worldcubeassociation.tnoodle.server.webscrambles.nupdf

import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.dsl.DocumentBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.dsl.PageBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.properties.Alignment
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.properties.Drawing
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.properties.Font
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.properties.Paper
import org.worldcubeassociation.tnoodle.server.webscrambles.nupdf.model.properties.Paper.pixelsToInch
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import java.util.*
import kotlin.math.roundToInt

class FmcScrambleCutoutNuSheet(
    val defScramble: Scramble,
    activityCode: ActivityCode,
    locale: Locale,
    totalAttemptsNum: Int,
    competitionTitle: String,
    hasGroupID: Boolean
) : FmcNuSheet(defScramble, activityCode, locale, totalAttemptsNum, competitionTitle, hasGroupID) {
    override fun DocumentBuilder.writeContents() {
        page {
            setVerticalMargins(10)
            setHorizontalMargins(20)

            addFmcScrambleCutoutSheet()
        }
    }

    private fun PageBuilder.addFmcScrambleCutoutSheet() {
        val scrambleSuffix = scrambleXOfY
            .takeIf { totalAttemptsNum > 1 }.orEmpty()

        val title = "$activityTitle $scrambleSuffix".trim()

        val baseFont = Font.fontForLocale(Translate.DEFAULT_LOCALE)
        val localFont = Font.fontForLocale(locale)

        val paddingHeightPenalty = SCRAMBLES_PER_SHEET * 2 * Drawing.Padding.DEFAULT

        val actualWidthIn = size.widthIn - (marginLeft + marginRight).pixelsToInch
        val actualHeightIn = size.heightIn - (marginTop + marginBottom).pixelsToInch -
            paddingHeightPenalty.pixelsToInch

        val scramblerPreferredSize = scramblingPuzzle.preferredSize
        val scramblerWidthToHeight = scramblerPreferredSize.width.toFloat() / scramblerPreferredSize.height

        table(2) {
            // see GeneralScrambleSheet to figure out what this is about (:
            val relativeHeight = actualHeightIn / actualWidthIn
            val relHeightPerScramble = relativeHeight / SCRAMBLES_PER_SHEET

            val scrambleWidth = relHeightPerScramble * scramblerWidthToHeight

            // as we're always printing more than 1 scramble per sheet,
            // naively assume that fullWidth < 1
            val textWidth = 1 - scrambleWidth
            relativeWidths = listOf(textWidth, scrambleWidth)

            border = Drawing.Border.ROWS_ONLY
            stroke = Drawing.Stroke.DASHED

            repeat(SCRAMBLES_PER_SHEET) {
                row {
                    verticalAlignment = Alignment.Vertical.MIDDLE

                    cell {
                        paragraph {
                            leading = 1f

                            // TODO this is a hack to prevent some margins overlapping
                            // figure out a cleaner way moving forward!
                            val scaledTextWidth = textWidth * 0.98f

                            line(competitionTitle) {
                                fontName = baseFont

                                val relHeightForCompName = relHeightPerScramble / 8
                                setOptimalOneLineFontSize(relHeightForCompName, scaledTextWidth, actualWidthIn)
                            }
                            line(title) {
                                fontName = localFont

                                val relHeightForTitle = relHeightPerScramble / 4
                                setOptimalOneLineFontSize(relHeightForTitle, scaledTextWidth, actualWidthIn)
                            }
                            line(defScramble.scrambleString) {
                                fontName = baseFont

                                val relHeightForScrambleString = relHeightPerScramble / 2
                                setOptimalOneLineFontSize(relHeightForScrambleString, scaledTextWidth, actualWidthIn)
                            }
                        }
                    }

                    cell {
                        padding = 2 * Drawing.Padding.DEFAULT
                        horizontalAlignment = Alignment.Horizontal.CENTER

                        // TODO okay to round here?
                        val scrambleWidthPx = (scrambleWidth * actualWidthIn * Paper.DPI).roundToInt()
                        svgScrambleImage(defScramble.scrambleString, scrambleWidthPx)
                    }
                }
            }
        }
    }

    companion object {
        val SCRAMBLES_PER_SHEET = 8
    }
}
