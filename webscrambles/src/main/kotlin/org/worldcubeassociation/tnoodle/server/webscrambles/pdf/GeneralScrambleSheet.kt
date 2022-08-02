package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.dsl.DocumentBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.dsl.TableBuilder
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.*
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Paper.inchesToPixel
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Paper.pixelsToInch
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.FontUtil
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.ScramblePhrase
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.ScrambleRow
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import java.util.*
import kotlin.math.ceil
import kotlin.math.max

class GeneralScrambleSheet(
    private val scrambleSet: ScrambleSet,
    private val tNoodleVersion: String,
    competitionTitle: String,
    activityCode: ActivityCode,
    hasGroupId: Boolean,
    locale: Locale,
    watermark: String? = null
) : ScrambleSheet(competitionTitle, activityCode, hasGroupId, locale, watermark) {
    override val scrambles: List<Scramble>
        get() = scrambleSet.allScrambles

    override val scrambleSetId: Int
        get() = scrambleSet.id

    private fun TableBuilder.scrambleRows(
        scramblePhrases: List<ScramblePhrase>,
        scrLineHeight: Float,
        scrImageWidth: Float,
        unitToInches: Float,
        labelPrefix: String? = null
    ) {
        val highestLineCount = scramblePhrases.maxOf { it.lines.size }
        val useHighlighting = highestLineCount >= MIN_LINES_HIGHLIGHTING

        for (scramblePhrase in scramblePhrases) {
            row {
                cell {
                    verticalAlignment = Alignment.Vertical.MIDDLE
                    horizontalAlignment = Alignment.Horizontal.CENTER

                    val labelString = "${labelPrefix.orEmpty()}${scramblePhrase.row.index + 1}".trim()
                    text(labelString)
                }

                cell {
                    verticalAlignment = Alignment.Vertical.MIDDLE

                    leading = SCRAMBLE_TEXT_LEADING
                    padding = DEFAULT_CELL_PADDING

                    paragraph {
                        fontName = Font.MONO
                        fontSize = scramblePhrase.fontSize

                        val maxLength = scramblePhrase.lines.maxOf { it.length }

                        for ((ln, scrLine) in scramblePhrase.lines.withIndex()) {
                            val paddedLine = scrLine.padEnd(maxLength, Typography.nbsp)

                            line(paddedLine) {
                                if (useHighlighting && ln % 2 == 1) {
                                    background = SCRAMBLE_HIGHLIGHTING_COLOR
                                }
                            }
                        }
                    }
                }

                cell {
                    background = SCRAMBLE_BACKGROUND_COLOR
                    padding = DEFAULT_CELL_PADDING

                    val paddingBackoff = paddingBackoff(DEFAULT_CELL_PADDING)

                    val scrImageWidthPx = (scrImageWidth * unitToInches).inchesToPixel - paddingBackoff
                    val scrLineHeightPx = (scrLineHeight * unitToInches).inchesToPixel - paddingBackoff

                    svgScrambleImage(scramblePhrase.row.scramble, scrImageWidthPx, scrLineHeightPx)
                }
            }
        }
    }

    private fun computeScramblePhrases(
        scramblePageChunk: List<ScrambleRow>,
        availableHeight: Float,
        availableTextWidth: Float,
        unitToInches: Float
    ): List<ScramblePhrase> {
        val basicScramblePhrases = scramblePageChunk.map {
            ScramblePhrase.fromScrambleRow(
                it,
                availableHeight,
                availableTextWidth,
                unitToInches,
                SCRAMBLE_TEXT_LEADING
            )
        }

        val smallestFontSize = basicScramblePhrases.minOf { it.fontSize }
        val allOneLine = basicScramblePhrases.all { it.lines.size == 1 }

        return basicScramblePhrases.map {
            val breakChunks = if (allOneLine) listOf(it.row.rawTokens) else it.row.paddedTokens

            val maxLineTokens = FontUtil.splitToFixedSizeLines(
                breakChunks,
                smallestFontSize,
                availableTextWidth,
                unitToInches,
                ScramblePhrase.DEFAULT_GLUE,
                ScramblePhrase.DEFAULT_PADDING
            )

            it.copy(lines = maxLineTokens, fontSize = smallestFontSize)
        }
    }

    override fun DocumentBuilder.writeContents() {
        showHeaderTimestamp = true

        val scrambleRows = ScrambleRow.rowsFromScrambleSet(scrambleSet)
        val scrambleRowPages = scrambleRows.chunked(MAX_SCRAMBLES_PER_PAGE)

        val scramblerPreferredSize = scramblingPuzzle.preferredSize
        val scramblerWidthToHeight = scramblerPreferredSize.width.toFloat() / scramblerPreferredSize.height

        showPageNumbers = scrambleRowPages.size > 1

        val roundDetails = activityCode.compileTitleString(locale, true, hasGroupId)

        for (scramblePageChunk in scrambleRowPages) {
            page {
                headerLines = competitionTitle to roundDetails
                footerLine = "Generated by $tNoodleVersion" // TODO i18n

                val heightExtraPenalty =
                    if (scrambleSet.extraScrambles.isNotEmpty()) 2 * EXTRA_SCRAMBLE_LABEL_SIZE else 0f

                val tableWidthIn = availableWidthIn
                val tableHeightIn = availableHeightIn - ceil(heightExtraPenalty).toInt().pixelsToInch

                table(3) {
                    // PDF tables are calculated by *relative* width. So to figure out the scramble image width we...
                    // 1. interpret the page height as a multiple of the unit page width
                    val relativeHeight = tableHeightIn / tableWidthIn
                    // 2. split it by however many scrambles we want,
                    val relHeightPerScramble = relativeHeight / scramblePageChunk.size
                    // 3. scale those heights by the preferred proportions of the scramblers
                    val fullWidth = relHeightPerScramble * scramblerWidthToHeight
                    // and finally limit it down to one third of the page.
                    val scrambleImageProportion = 1 / fullWidth
                    val scrambleImageParts = max(MAX_SCRAMBLE_IMAGE_RATIO.toFloat(), scrambleImageProportion)

                    // label column is 1/25, scrambles are 1/scrambleImageParts.
                    // poor man's LCM: 25*scrambleImageParts :)
                    val gcd = MAX_INDEX_COLUMN_RATIO * scrambleImageParts
                    // 25 parts go to label column, $scrambleImageParts parts go to the scramble Image.
                    val scrambleStringParts = gcd - MAX_INDEX_COLUMN_RATIO - scrambleImageParts
                    // finally, put it all together :)
                    // when calculating the GCD, we extended 1/25 by n and 1/n by 25.
                    // that's why the column order _seems_ to be flipped around here.
                    // but proportionally everything is in order!
                    relativeWidths = listOf(scrambleImageParts, scrambleStringParts, MAX_INDEX_COLUMN_RATIO.toFloat())

                    val totalWidth = relativeWidths.sum()

                    val scrambleImageWidth = MAX_INDEX_COLUMN_RATIO / totalWidth
                    val scrambleTextWidth = scrambleStringParts / totalWidth

                    val paddingPenalty = paddingBackoff(DEFAULT_CELL_PADDING).pixelsToInch / tableWidthIn

                    // leading calculation for smaller font sizes in iText 7 is currently broken
                    // so we make the text boxes artificially lower than they actually are.
                    val chunkHeight = (relHeightPerScramble - 2 * paddingPenalty)
                    val chunkWidth = (scrambleTextWidth - paddingPenalty)

                    val scramblePhrases = computeScramblePhrases(
                        scramblePageChunk,
                        chunkHeight,
                        chunkWidth,
                        tableWidthIn
                    )

                    val (standardScrambles, extraScrambles) = scramblePhrases.partition { !it.row.isExtra }

                    scrambleRows(
                        standardScrambles,
                        relHeightPerScramble,
                        scrambleImageWidth,
                        tableWidthIn
                    )

                    if (extraScrambles.isNotEmpty()) {
                        row(1) {
                            cell {
                                horizontalAlignment = Alignment.Horizontal.CENTER

                                border = Drawing.Border.NONE
                                padding = DEFAULT_CELL_PADDING

                                text(TABLE_HEADING_EXTRA_SCRAMBLES) {
                                    fontWeight = Font.Weight.BOLD
                                    fontSize = EXTRA_SCRAMBLE_LABEL_SIZE
                                }
                            }
                        }

                        scrambleRows(
                            extraScrambles,
                            relHeightPerScramble,
                            scrambleImageWidth,
                            tableWidthIn,
                            EXTRA_SCRAMBLE_PREFIX
                        )
                    }
                }
            }
        }
    }

    companion object {
        const val MAX_SCRAMBLES_PER_PAGE = 7
        const val MIN_LINES_HIGHLIGHTING = 4

        const val SCRAMBLE_TEXT_LEADING = 0.95f

        const val TABLE_HEADING_EXTRA_SCRAMBLES = "Extra Scrambles" // TODO i18n
        const val EXTRA_SCRAMBLE_PREFIX = "E"

        const val EXTRA_SCRAMBLE_LABEL_SIZE = Font.Size.DEFAULT

        const val DEFAULT_CELL_PADDING = 2 * Drawing.Padding.DEFAULT

        const val MAX_SCRAMBLE_IMAGE_RATIO = 3
        const val MAX_INDEX_COLUMN_RATIO = 25

        val SCRAMBLE_BACKGROUND_COLOR = RgbColor(192, 192, 192)
        val SCRAMBLE_HIGHLIGHTING_COLOR = RgbColor(230, 230, 230)

        // fitting stuff into padded boxes doesn't work the way I thought it would.
        private fun paddingBackoff(padding: Int): Int {
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
