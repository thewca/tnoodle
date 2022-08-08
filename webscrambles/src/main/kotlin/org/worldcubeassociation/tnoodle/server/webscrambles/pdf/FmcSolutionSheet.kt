package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.Table
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.dsl.*
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Alignment
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Drawing
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Font
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Paper.inchesToPixel
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Paper.inchesToPixelPrecise
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Paper.pixelsToInch
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.FontUtil
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFScrambleMatcher
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import java.util.*

class FmcSolutionSheet(
    scramble: Scramble,
    totalAttemptsNum: Int,
    scrambleSetId: Int,
    competitionTitle: String,
    activityCode: ActivityCode,
    hasGroupId: Boolean,
    locale: Locale,
    watermark: String? = null
) : FewestMovesSheet(scramble, totalAttemptsNum, scrambleSetId, competitionTitle, activityCode, hasGroupId, locale, watermark) {
    private val drawScramble: Boolean
        get() = scramble.scrambleString.isNotEmpty()

    override fun DocumentBuilder.writeContents() {
        page {
            // yes, setting *all* margins to the narrower *horizontal* margins on purpose.
            setMargins(Drawing.Margin.DEFAULT_HORIZONTAL)

            addFmcSolutionSheet()
        }
    }

    protected fun CellBuilder.addNotationTable(title: String, moves: List<List<String>>): Table {
        val directions = listOf(
            Translate("fmc.clockwise", locale),
            Translate("fmc.counterClockwise", locale),
            Translate("fmc.double", locale)
        )

        val numColumns = moves.maxOf { it.size } + 1 // plus one for the left-most label column
        val tableRows = directions.zip(moves)

        return table(numColumns) {
            relativeWidths = listOf(5f, 1f, 1f, 1f, 1f, 1f, 1f)

            row {
                cell {
                    horizontalAlignment = Alignment.Horizontal.RIGHT

                    text(title) {
                        fontWeight = Font.Weight.BOLD
                    }
                }
                cell(numColumns - 1) {
                    text("")
                }
            }
            for ((direction, line) in tableRows) {
                row {
                    cell {
                        horizontalAlignment = Alignment.Horizontal.RIGHT

                        text(direction)
                    }
                    for (move in line) {
                        cell {
                            verticalAlignment = Alignment.Vertical.MIDDLE

                            text(move) {
                                fontName = Font.MONO
                                fontSize *= 1.1f
                            }
                        }
                    }
                }
            }
        }
    }

    protected fun CellBuilder.addTopLeftRulesAndDescriptionTable(columnWidthIn: Float, infoSectionHeightIn: Float): Table {
        val substitutions = mapOf("maxMoves" to WCA_MAX_MOVES_FMC.toString())

        val rulesList = List(NUMBER_OF_RULES) { ruleNum ->
            val ruleSubstitutions = substitutions.takeIf { ruleNum == 3 }.orEmpty()
            Translate("fmc.rule${ruleNum + 1}", locale, ruleSubstitutions)
        }.map { "• $it" }

        val pureMoves = DIRECTION_MODIFIERS.map { mod -> WCA_MOVES.map { mov -> "$mov$mod" } }
        val rotationMoves = DIRECTION_MODIFIERS.map { mod ->
            WCA_ROTATIONS.map { mov ->
                "$mov$mod".takeIf { mov.isNotBlank() }.orEmpty()
            }
        }

        val moveTypes = mapOf(
            Translate("fmc.faceMoves", locale) to pureMoves,
            Translate("fmc.rotations", locale) to rotationMoves
        )

        return table(1) {
            border = Drawing.Border.NONE

            row {
                cell {
                    horizontalAlignment = Alignment.Horizontal.CENTER
                    leading = COMPETITION_TITLE_LEADING

                    optimalText(localEventTitle, infoSectionHeightIn / UPPER_LEFT_TITLE_RATIO, columnWidthIn)
                }
            }

            val ruleBoxHeight = (infoSectionHeightIn - paddingBackoff(padding).pixelsToInch) / UPPER_LEFT_RULES_RATIO
            val ruleLineHeight = ruleBoxHeight / RULES_MAX_NUMBER_OF_LINES

            val ruleFontSize = rulesList.map {
                FontUtil.computeOneLineFontSize(it, ruleLineHeight, columnWidthIn, fontName.orEmpty(), leading = 1f)
            }.average().toFloat()

            row {
                cell {
                    horizontalAlignment = Alignment.Horizontal.JUSTIFIED

                    evenParagraph {
                        for (rule in rulesList) {
                            line(rule) { fontSize = ruleFontSize }
                        }
                    }
                }
            }
            for ((moveType, moves) in moveTypes) {
                row {
                    cell {
                        fontSize = ruleFontSize * RULES_MOVE_TABLE_FONT_SCALE

                        addNotationTable(moveType, moves)
                    }
                }
            }
        }
    }

    protected fun TableBuilder.addTopRightCompetitionInfoTable(columnWidthIn: Float, infoSectionHeightIn: Float) {
        if (drawScramble) {
            row {
                cell {
                    horizontalAlignment = Alignment.Horizontal.CENTER

                    val titleLines = listOfNotNull(
                        competitionTitle,
                        activityTitle,
                        scrambleXOfY.takeIf { totalAttemptsNum > 1 }
                    )

                    val maxTitleBoxHeightIn = (infoSectionHeightIn - paddingBackoff(padding).pixelsToInch) / UPPER_RIGHT_INFO_BOX_RATIO_MEDIUM

                    evenParagraph {
                        fontName = Font.SANS_SERIF
                        leading = COMPETITION_TITLE_LEADING

                        for (ln in titleLines) {
                            optimalLine(ln, maxTitleBoxHeightIn / titleLines.size, columnWidthIn)
                        }
                    }
                }
            }
        }
        row {
            cell {
                padding = FILL_OUT_BOXES_PADDING

                evenParagraph {
                    leading = FILL_OUT_BOXES_LEADING

                    val competitionDesc = Translate("fmc.competition", locale) + LONG_FILL
                    val roundDesc = Translate("fmc.round", locale) + SHORT_FILL
                    val attemptDesc = Translate("fmc.attempt", locale) + SHORT_FILL

                    val competitorDesc = Translate("fmc.competitor", locale) + LONG_FILL
                    val wcaIdDesc = "WCA ID" + WCA_ID_FILL // TODO i18n
                    val registrantIdDesc = Translate("fmc.registrantId", locale) + SHORT_FILL

                    val competitorInfoLines = listOfNotNull(
                        competitionDesc.takeUnless { drawScramble },
                        roundDesc.takeUnless { drawScramble },
                        attemptDesc.takeUnless { drawScramble },
                        competitorDesc,
                        wcaIdDesc,
                        registrantIdDesc
                    )

                    val maxTitleBoxHeightIn = (infoSectionHeightIn - paddingBackoff(padding).pixelsToInch) / UPPER_RIGHT_INFO_BOX_RATIO_LARGE
                    val maxTitleRowHeightIn = maxTitleBoxHeightIn / 3

                    for (ln in competitorInfoLines) {
                        optimalLine(ln, maxTitleRowHeightIn, columnWidthIn)
                    }
                }
            }
        }
        row {
            cell {
                horizontalAlignment = Alignment.Horizontal.CENTER

                padding = FILL_OUT_BOXES_PADDING

                evenParagraph {
                    leading = GRADING_BOXES_LEADING

                    val maxGradingBoxHeightIn = (infoSectionHeightIn - paddingBackoff(padding).pixelsToInch) / UPPER_RIGHT_INFO_BOX_RATIO_SMALL

                    val warningText = Translate("fmc.warning", locale)
                    optimalLine(warningText, maxGradingBoxHeightIn / 2, columnWidthIn)

                    val gradingTextGradedBy = Translate("fmc.graded", locale) + LONG_FILL
                    val gradingTextResult = Translate("fmc.result", locale) + SHORT_FILL

                    val gradingText = "$gradingTextGradedBy $gradingTextResult"
                    optimalLine(gradingText, maxGradingBoxHeightIn / 2, columnWidthIn)
                }
            }
        }
        row {
            cell {
                verticalAlignment = Alignment.Vertical.MIDDLE
                horizontalAlignment = Alignment.Horizontal.CENTER

                val columnWidthPx = columnWidthIn.inchesToPixel - paddingBackoff(padding)

                if (drawScramble) {
                    val scrambleRowHeightPx = (3 * infoSectionHeightIn.inchesToPixelPrecise / UPPER_RIGHT_INFO_BOX_RATIO_LARGE) - paddingBackoff(padding)

                    svgScrambleImage(scramble.scrambleString, columnWidthPx, scrambleRowHeightPx.toInt())
                } else {
                    val scrambleAdviceHeightIn = (2 * infoSectionHeightIn / UPPER_RIGHT_INFO_BOX_RATIO_LARGE) - paddingBackoff(padding).pixelsToInch

                    val separateSheetAdvice = Translate("fmc.scrambleOnSeparateSheet", locale)
                    optimalText(separateSheetAdvice, scrambleAdviceHeightIn, columnWidthPx.pixelsToInch)
                }
            }
        }
    }

    protected fun PageBuilder.addFmcSolutionSheet() {
        val actualHeightIn = availableHeightIn
        val actualWidthIn = availableWidthIn

        val scrambleColumnWidthIn = (actualWidthIn * SCRAMBLE_IMAGE_WIDTH_PERCENT / 100f) -
            paddingBackoff(FILL_OUT_BOXES_PADDING).pixelsToInch

        val ruleColumnWidthIn = (actualWidthIn * (100 - SCRAMBLE_IMAGE_WIDTH_PERCENT) / 100f) -
            paddingBackoff(FILL_OUT_BOXES_PADDING).pixelsToInch

        val infoSectionHeightIn = actualHeightIn / 2

        table(2) {
            fontName = Font.fontForLocale(locale)

            relativeWidths = listOf(100f - SCRAMBLE_IMAGE_WIDTH_PERCENT, SCRAMBLE_IMAGE_WIDTH_PERCENT.toFloat())

            row {
                cell {
                    // 3 = competitor details, grading field, scramble field
                    // (which will either contain the actual scramble or the "see separate sheet" notice)
                    // The additional +1 is for when we print the title of the competition directly
                    // instead of as a part of the "competitor details" self-fill-out
                    rowSpan = 3 + (if (drawScramble) 1 else 0)

                    addTopLeftRulesAndDescriptionTable(ruleColumnWidthIn, infoSectionHeightIn)
                }

                // technically missing a row here, but as "row {}" is just a convenience wrapper anyways
                // it doesn't matter for the rendering end result.
            }

            addTopRightCompetitionInfoTable(scrambleColumnWidthIn, infoSectionHeightIn)

            if (drawScramble) {
                row(1) {
                    cell {
                        horizontalAlignment = Alignment.Horizontal.CENTER

                        padding = 2 * Drawing.Padding.DEFAULT
                        leading = SCRAMBLE_FIELD_LEADING

                        paragraph {
                            val scramblePrefix = Translate("fmc.scramble", locale)

                            line(scramblePrefix) {
                                fontSize = SCRAMBLE_FIELD_LABEL_FONT_SIZE
                            }

                            // hack to introudce horizontal padding without affecting vertical padding
                            val scrambleWidth = actualWidthIn - paddingBackoff(2 * padding).pixelsToInch

                            // picking a height value that is much too large intentionally
                            // to force scaling down by width instead.
                            optimalLine(scramble.scrambleString, actualHeightIn, scrambleWidth) {
                                fontName = Font.STANDARD
                            }
                        }
                    }
                }
            }

            row(1) {
                val writingLine = List(MOVE_BARS_PER_LINE) { "_" }.joinToString(" ")
                val writingLnHeight = (actualHeightIn - infoSectionHeightIn) / MOVE_BAR_LINES

                cell {
                    horizontalAlignment = Alignment.Horizontal.CENTER

                    padding = Drawing.Padding.DEFAULT

                    paragraph {
                        fontName = Font.MONO
                        fontSize = FontUtil.computeOneLineFontSize(writingLine, writingLnHeight, actualWidthIn, Font.MONO, leading = MOVE_BAR_LEADING)

                        leading = MOVE_BAR_LEADING

                        repeat(MOVE_BAR_LINES) {
                            line(writingLine)
                        }
                    }
                }
            }
        }
    }

    companion object {
        const val SCRAMBLE_IMAGE_WIDTH_PERCENT = 45

        const val UPPER_RIGHT_INFO_BOX_RATIO_LARGE = 8
        const val UPPER_RIGHT_INFO_BOX_RATIO_MEDIUM = 10
        const val UPPER_RIGHT_INFO_BOX_RATIO_SMALL = 12

        const val UPPER_LEFT_TITLE_RATIO = 10
        const val UPPER_LEFT_RULES_RATIO = 3

        const val RULES_MAX_NUMBER_OF_LINES = 10
        const val RULES_MOVE_TABLE_FONT_SCALE = 0.75f

        const val SCRAMBLE_FIELD_LABEL_FONT_SIZE = 9f
        const val SCRAMBLE_FIELD_LEADING = 1f

        const val COMPETITION_TITLE_LEADING = 1f

        const val MOVE_BAR_LEADING = 1.1f

        const val GRADING_BOXES_LEADING = 1.5f

        const val FILL_OUT_BOXES_LEADING = 2f
        const val FILL_OUT_BOXES_PADDING = 2 * Drawing.Padding.DEFAULT

        const val SHORT_FILL = ": ____"
        const val LONG_FILL = ": __________________"
        const val WCA_ID_FILL = ": __ __ __ __  __ __ __ __  __ __"

        const val NUMBER_OF_RULES = 6

        val WCA_MOVES = arrayOf("R", "U", "F", "L", "D", "B")
        val WCA_ROTATIONS = arrayOf("x", "y", "z", "", "", "")

        val DIRECTION_MODIFIERS = arrayOf("", "'", "2")

        private val DUMMY_SCRAMBLE = Scramble("")
        private val DUMMY_ACTIVITY = ActivityCode.compile(EventData.THREE_FM, 0, 0, 0)

        fun genericBlankSheet(locale: Locale, compName: String, watermark: String?): FmcSolutionSheet {
            return FmcSolutionSheet(
                DUMMY_SCRAMBLE,
                1,
                WCIFScrambleMatcher.ID_PENDING,
                compName,
                DUMMY_ACTIVITY,
                false,
                locale,
                watermark
            )
        }
    }
}
