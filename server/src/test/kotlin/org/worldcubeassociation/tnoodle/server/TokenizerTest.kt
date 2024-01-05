package org.worldcubeassociation.tnoodle.server

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.pdf.util.FontUtil
import org.worldcubeassociation.tnoodle.server.pdf.util.ScrambleStringUtil

class TokenizerTest {
    @Test
    fun `test that tokenizing scramble strings does not lose information`() {
        for (event in EventData.entries) {
            println("Generating random scrambles for ${event.id}")

            event.scrambler.generateEfficientScrambles(SCRAMBLE_REPETITIONS) {
                val tokenizedScramble = ScrambleStringUtil.splitToTokens(it)
                val gluedTogetherScramble = tokenizedScramble.joinToString(ScrambleStringUtil.MOVES_DELIMITER) { (str, _) -> str.trim() }

                assertScramblesEqual(event, it, gluedTogetherScramble)
            }
        }
    }

    @Test
    fun `test that splitting scramble strings does not lose information`() {
        for (event in EventData.entries) {
            println("Generating random scrambles for ${event.id}")

            event.scrambler.generateEfficientScrambles(SCRAMBLE_REPETITIONS) {
                val tokenizedScramble = ScrambleStringUtil.split(it)
                val gluedTogetherScramble = tokenizedScramble.joinToString(ScrambleStringUtil.MOVES_DELIMITER)

                assertScramblesEqual(event, it, gluedTogetherScramble)
            }
        }
    }

    @Test
    fun `test that splitting to lines does not lose information`() {
        for (event in EventData.entries) {
            println("Generating random scrambles for ${event.id}")

            event.scrambler.generateEfficientScrambles(SCRAMBLE_REPETITIONS) {
                val tokenizedScramble = ScrambleStringUtil.splitToTokens(it)
                val lineSplitScramble = FontUtil.splitAtPossibleBreaks(tokenizedScramble)

                val gluedTogetherScramble = lineSplitScramble.joinToString(ScrambleStringUtil.MOVES_DELIMITER) { line ->
                    line.joinToString(ScrambleStringUtil.MOVES_DELIMITER) { str -> str.trim() }
                }

                assertScramblesEqual(event, it, gluedTogetherScramble)
            }
        }
    }

    @Test
    fun `test that splitting to fixed size does not lose information`() {
        for (event in EventData.entries) {
            println("Generating random scrambles for ${event.id}")

            event.scrambler.generateEfficientScrambles(SCRAMBLE_REPETITIONS) {
                val tokenizedScramble = ScrambleStringUtil.splitToTokens(it)
                val lineSplitScramble = FontUtil.splitAtPossibleBreaks(tokenizedScramble)

                for (fontSize in listOf(3f, 12f, 120f)) {
                    for (lineWidth in listOf(12f, 120f, 1200f)) {
                        for (unitToInches in listOf(.2f, 1f, 2f, 2000f)) {
                            val lines = FontUtil.splitToFixedSizeLines(
                                lineSplitScramble,
                                fontSize,
                                lineWidth,
                                unitToInches,
                                ScrambleStringUtil.MOVES_DELIMITER
                            )

                            val gluedTogetherScramble = lines.joinToString(ScrambleStringUtil.MOVES_DELIMITER) { str -> str.trim() }
                                .replace(ScrambleStringUtil.NBSP_STRING, "")

                            assertScramblesEqual(event, it, gluedTogetherScramble)
                        }
                    }
                }
            }
        }
    }

    @Test
    fun `test that splitting to max size does not lose information`() {
        for (event in EventData.entries) {
            println("Generating random scrambles for ${event.id}")

            event.scrambler.generateEfficientScrambles(SCRAMBLE_REPETITIONS) {
                val tokenizedScramble = ScrambleStringUtil.splitToTokens(it)
                val lineSplitScramble = FontUtil.splitAtPossibleBreaks(tokenizedScramble)

                for (boxHeight in listOf(12f, 120f, 1200f)) {
                    for (boxWidth in listOf(12f, 120f, 1200f)) {
                        for (leadingFactor in listOf(.9f, 1.2f, 2f)) {
                            val lines = FontUtil.splitToMaxFontSizeLines(
                                lineSplitScramble,
                                boxHeight,
                                boxWidth,
                                leadingFactor,
                                ScrambleStringUtil.MOVES_DELIMITER
                            )

                            val gluedTogetherScramble = lines.joinToString(ScrambleStringUtil.MOVES_DELIMITER) { str -> str.trim() }
                                .replace(ScrambleStringUtil.NBSP_STRING, "")

                            assertScramblesEqual(event, it, gluedTogetherScramble)
                        }
                    }
                }
            }
        }
    }

    companion object {
        const val SCRAMBLE_REPETITIONS = 20

        fun assertScramblesEqual(event: EventData, original: String, reconstructed: String) {
            // With Megaminx, it is a bit bothersome to reconstruct where the original newlines were.
            // Since they are cosmetical anyways, we just ignore them even in the original scramble.
            val originalScramble = if (event.id == "minx") original.replace("\n", " ") else original

            Assertions.assertEquals(originalScramble, reconstructed)
        }
    }
}
