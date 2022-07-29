package org.worldcubeassociation.tnoodle.server.webscrambles.pdf

import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.webscrambles.Translate
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.Table
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.dsl.*
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Alignment
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Drawing
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Font
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Paper.inchesToPixel
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.model.properties.Paper.pixelsToInch
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.WCIFScrambleMatcher
import org.worldcubeassociation.tnoodle.server.webscrambles.wcif.model.*
import java.util.*

class FmcSolutionSheet(
    scramble: Scramble,
    activityCode: ActivityCode,
    scrambleSetId: Int,
    locale: Locale,
    totalAttemptsNum: Int,
    competitionTitle: String,
    hasGroupId: Boolean,
    watermark: String? = null
) : FewestMovesSheet(scramble, totalAttemptsNum, scrambleSetId, competitionTitle, activityCode, hasGroupId, locale, watermark) {
    private val drawScramble: Boolean
        get() = scramble.scrambleString.isNotEmpty()

    override fun DocumentBuilder.writeContents() {
        page {
            // yes, setting the *vertical* margins to the narrower *horizontal* margins on purpose.
            setVerticalMargins(Drawing.Margin.DEFAULT_HORIZONTAL)

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
            fontSize = 7f

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
                            padding = 2 * Drawing.Padding.DEFAULT

                            text(move) {
                                fontName = Font.MONO
                                fontSize = 11f
                            }
                        }
                    }
                }
            }
        }
    }

    protected fun CellBuilder.addTopLeftRulesAndDescriptionTable(): Table {
        val substitutions = mapOf("maxMoves" to WCA_MAX_MOVES_FMC.toString())

        val rulesList = listOf(
            Translate("fmc.rule1", locale),
            Translate("fmc.rule2", locale),
            Translate("fmc.rule3", locale),
            Translate("fmc.rule4", locale, substitutions),
            Translate("fmc.rule5", locale),
            Translate("fmc.rule6", locale)
        )

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
            fontSize = 8f
            leading = 1.5f

            row {
                cell {
                    horizontalAlignment = Alignment.Horizontal.CENTER

                    text(localEventTitle) {
                        fontSize = 25f
                    }
                }
            }
            row {
                cell {
                    horizontalAlignment = Alignment.Horizontal.JUSTIFIED

                    paragraph {
                        for (rule in rulesList) {
                            line("• $rule")
                        }
                    }
                }
            }
            for ((moveType, moves) in moveTypes) {
                row {
                    cell {
                        addNotationTable(moveType, moves)
                    }
                }
            }
        }
    }

    protected fun TableBuilder.addTopRightCompetitionInfoTable(scrambleImageWidthPx: Int) {
        fontSize = 9f

        if (drawScramble) {
            row {
                cell {
                    horizontalAlignment = Alignment.Horizontal.CENTER

                    paragraph {
                        line(competitionTitle)
                        line(activityTitle)

                        if (totalAttemptsNum > 1) {
                            line(scrambleXOfY)
                        }
                    }
                }
            }
        }
        row {
            cell {
                padding = 3 * Drawing.Padding.DEFAULT
                border = Drawing.Border.COLS_ONLY

                paragraph {
                    fontSize = if (!drawScramble) 13f else 11f
                    leading = 2.5f

                    if (!drawScramble) {
                        val competitionDesc = Translate("fmc.competition", locale) + LONG_FILL
                        line(competitionDesc)

                        val roundDesc = Translate("fmc.round", locale) + SHORT_FILL
                        line(roundDesc)

                        val attemptDesc = Translate("fmc.attempt", locale) + SHORT_FILL
                        line(attemptDesc)
                    }

                    val competitorDesc = Translate("fmc.competitor", locale) + LONG_FILL
                    line(competitorDesc)

                    val wcaIdDesc = "WCA ID" + WCA_ID_FILL
                    line(wcaIdDesc)

                    val registrantIdDesc = Translate("fmc.registrantId", locale) + SHORT_FILL
                    line(registrantIdDesc)
                }
            }
        }
        row {
            cell {
                horizontalAlignment = Alignment.Horizontal.CENTER

                paragraph {
                    leading = 2f

                    val warningText = Translate("fmc.warning", locale)
                    line(warningText)

                    val gradingTextGradedBy = Translate("fmc.graded", locale) + LONG_FILL
                    val gradingTextResult = Translate("fmc.result", locale) + SHORT_FILL

                    val gradingText = "$gradingTextGradedBy $gradingTextResult"
                    line(gradingText)
                }
            }
        }
        row {
            cell {
                verticalAlignment = Alignment.Vertical.MIDDLE

                if (drawScramble) {
                    svgScrambleImage(scramble.scrambleString, scrambleImageWidthPx)
                } else {
                    horizontalAlignment = Alignment.Horizontal.CENTER

                    val separateSheetAdvice = Translate("fmc.scrambleOnSeparateSheet", locale)
                    text(separateSheetAdvice)
                }
            }
        }
    }

    protected fun PageBuilder.addFmcSolutionSheet() {
        val actualHeightIn = size.heightIn - (marginTop + marginBottom).pixelsToInch
        val actualWidthIn = size.widthIn - (marginLeft + marginRight).pixelsToInch

        val scrambleImageWidthPx = (actualWidthIn * 0.45f).inchesToPixel

        table(2) {
            fontName = Font.fontForLocale(locale)
            fontSize = 15f

            relativeWidths = listOf(55f, 45f)

            row {
                cell {
                    rowSpan = 3 + (if (!drawScramble) 0 else 1)

                    addTopLeftRulesAndDescriptionTable()
                }

                // technically missing a row here, but as "row {}" is just a convenience wrapper anyways
                // it doesn't matter for the rendering end result.
            }

            addTopRightCompetitionInfoTable(scrambleImageWidthPx)

            if (drawScramble) {
                row(1) {
                    border = Drawing.Border.COLS_ONLY

                    cell {
                        horizontalAlignment = Alignment.Horizontal.CENTER
                        padding = 2 * Drawing.Padding.DEFAULT

                        paragraph {
                            val scramblePrefix = Translate("fmc.scramble", locale)

                            line(scramblePrefix) {
                                fontSize = 7f
                            }

                            val scramble = scramble.scrambleString

                            line(scramble) {
                                fontName = Font.STANDARD

                                // a bit of subtraction for padding
                                val scrambleWidth = actualWidthIn - 20.pixelsToInch

                                // picking a height value that is much too large intentionally
                                // to force scaling down by width instead.
                                setOptimalOneLineFontSize(actualHeightIn, scrambleWidth)
                            }
                        }
                    }
                }
            }

            row(1) {
                val writingLine = List(MOVE_BARS_PER_LINE) { "_" }.joinToString(" ")

                cell {
                    horizontalAlignment = Alignment.Horizontal.CENTER

                    padding = Drawing.Padding.DEFAULT

                    paragraph {
                        fontName = Font.MONO
                        fontSize = 40f // TODO magic number. better calculate dynamically?

                        leading = 1.1f

                        repeat(MOVE_BAR_LINES) {
                            line(writingLine)
                        }
                    }
                }
            }
        }
    }

    companion object {
        const val SHORT_FILL = ": ____"
        const val LONG_FILL = ": __________________"
        const val WCA_ID_FILL = ": __ __ __ __  __ __ __ __  __ __"

        val WCA_MOVES = arrayOf("R", "U", "F", "L", "D", "B")
        val WCA_ROTATIONS = arrayOf("x", "y", "z", "", "", "")

        val DIRECTION_MODIFIERS = arrayOf("", "'", "2")

        private val DUMMY_SCRAMBLE = Scramble("")
        private val DUMMY_ACTIVITY = ActivityCode.compile(EventData.THREE_FM, 0, 0, 0)

        fun genericBlankSheet(locale: Locale, compName: String, watermark: String?): FmcSolutionSheet {
            return FmcSolutionSheet(
                DUMMY_SCRAMBLE,
                DUMMY_ACTIVITY,
                WCIFScrambleMatcher.ID_PENDING,
                locale,
                1,
                compName,
                false,
                watermark
            )
        }
    }
}
