package org.worldcubeassociation.tnoodle.server.webscrambles

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.worldcubeassociation.tnoodle.server.model.EventData
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.FontUtil
import org.worldcubeassociation.tnoodle.server.webscrambles.pdf.util.ScrambleStringUtil

class TokenizerTest {
    @Test
    fun `test that tokenizing scramble strings does not lose information`() {
        for (event in EventData.entries) {
            println("Generating random scrambles for ${event.id}")

            event.scrambler.generateEfficientScrambles(SCRAMBLE_REPETITIONS) {
                val tokenizedScramble = ScrambleStringUtil.splitToTokens(it)
                val gluedTogetherScramble = tokenizedScramble.joinToString(ScrambleStringUtil.MOVES_DELIMITER) { (str, _) -> str.trim() }

                // With Megaminx, it is a bit bothersome to reconstruct where the original newlines were.
                // Since they are cosmetical anyways, we just ignore them even in the original scramble.
                val originalScramble = if (event.id == "minx") it.replace("\n", " ") else it

                Assertions.assertEquals(originalScramble, gluedTogetherScramble)
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

                // With Megaminx, it is a bit bothersome to reconstruct where the original newlines were.
                // Since they are cosmetical anyways, we just ignore them even in the original scramble.
                val originalScramble = if (event.id == "minx") it.replace("\n", " ") else it

                Assertions.assertEquals(originalScramble, gluedTogetherScramble)
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

                // With Megaminx, it is a bit bothersome to reconstruct where the original newlines were.
                // Since they are cosmetical anyways, we just ignore them even in the original scramble.
                val originalScramble = if (event.id == "minx") it.replace("\n", " ") else it

                Assertions.assertEquals(originalScramble, gluedTogetherScramble)
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
                        val lines = FontUtil.splitToFixedSizeLines(
                            lineSplitScramble,
                            fontSize,
                            lineWidth,
                            1f,
                            ScrambleStringUtil.MOVES_DELIMITER
                        )

                        val gluedTogetherScramble = lines.joinToString(ScrambleStringUtil.MOVES_DELIMITER) { str -> str.trim() }
                            .replace(ScrambleStringUtil.NBSP_STRING, "")

                        // With Megaminx, it is a bit bothersome to reconstruct where the original newlines were.
                        // Since they are cosmetical anyways, we just ignore them even in the original scramble.
                        val originalScramble = if (event.id == "minx") it.replace("\n", " ") else it

                        Assertions.assertEquals(originalScramble, gluedTogetherScramble)
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

                            // With Megaminx, it is a bit bothersome to reconstruct where the original newlines were.
                            // Since they are cosmetical anyways, we just ignore them even in the original scramble.
                            val originalScramble = if (event.id == "minx") it.replace("\n", " ") else it

                            Assertions.assertEquals(originalScramble, gluedTogetherScramble)
                        }
                    }
                }
            }
        }
    }

    companion object {
        const val SCRAMBLE_REPETITIONS = 20
    }
}
