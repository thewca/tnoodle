package org.worldcubeassociation.tnoodle.server.webscrambles

import kotlinx.serialization.Serializable
import org.worldcubeassociation.tnoodle.scrambles.Puzzle
import org.worldcubeassociation.tnoodle.svglite.Color
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.Colorizer
import org.worldcubeassociation.tnoodle.server.webscrambles.serial.Puzzlerizer
import java.net.URLDecoder
import java.util.*
import kotlin.math.min

@Serializable
@Deprecated("Use WCIF instead.")
data class ScrambleRequest(
    val scrambles: List<String>,
    val extraScrambles: List<String>,
    val scrambler: @Serializable(with = Puzzlerizer::class) Puzzle,
    val copies: Int,
    val title: String,
    val fmc: Boolean,
    val colorScheme: HashMap<String, @Serializable(with = Colorizer::class) Color>? = null,

    // totalAttempt and attempt are useful for when we have multiple attempts split in the schedule.
    // Usually, tnoodle prints scrambles for a ScrambleRequest iterating over ScrambleRequest.scrambles.
    // So, if ScrambleRequest.scrambles.length == 3, tnoodle prints Scramble 1 of 3, Scramble 2 of 3 and Scramble 3 of 3.
    // But for OrderedScrambles, these scrambles are split on the schedule, so we replace Scramble.scrambles = {Scramble.scrambles[attempt]}.
    // To continue printing Scramble x of y, we use attempt as x and totalAttempt as y.
    val totalAttempt: Int = 0,
    val attempt: Int = 0,

    // The following attributes are here purely so the scrambler ui
    // can pass these straight to the generated JSON we put in the
    // zip file. This makes it easier to align that JSON with the rounds
    // of a competition.
    val group: String? = null, // This legacy field is still used by the WCA Workbook Assistant. When we get rid of the WA, we can get rid of this.
    val scrambleSetId: String? = null,
    val event: String,
    val round: Int
) {
    companion object {
        private val MAX_COUNT = 100
        private val MAX_COPIES = 100

        fun empty(scrambler: Puzzle) =
            ScrambleRequest(
                listOf(),
                listOf(),
                scrambler,
                0,
                "",
                false,
                null,
                0,
                0,
                null,
                null,
                "",
                0
            )

        fun parseScrambleRequest(title: String, reqUrl: String, seed: String?): ScrambleRequest {
            // Note that we prefix the seed with the title of the round! This ensures that we get unique
            // scrambles in different rounds. Thanks to Ravi Fernando for noticing this at Stanford Fall 2011.
            // (http://www.worldcubeassociation.org/results/c.php?i=StanfordFall2011).
            val uniqueSeed = seed?.let { "$title$it" }

            val destructuredRequest = reqUrl.split("*").map { URLDecoder.decode(it, "utf-8") }

            val puzzle = destructuredRequest[0]
            val countStr = destructuredRequest.getOrNull(1) ?: "1"
            val copiesStr = destructuredRequest.getOrNull(2) ?: "1"
            val scheme = destructuredRequest.getOrNull(3) ?: ""

            val decodedTitle = URLDecoder.decode(title, "utf-8")

            val plugin = PuzzlePlugins.WCA_PUZZLES[puzzle]
                ?: throw InvalidScrambleRequestException("Invalid scrambler: $puzzle")

            val scrambler = plugin.scrambler

            val fmc = countStr == "fmc"

            val count = if (fmc) 1 else min(countStr.toInt(), MAX_COUNT)

            val copies = min(copiesStr.toInt(), MAX_COPIES)

            val scrambles = uniqueSeed?.let { scrambler.generateSeededScrambles(seed, count).asList() }
                ?: plugin.generateEfficientScrambles(count)

            val colorScheme = scrambler.parseColorScheme(scheme)

            return empty(scrambler).copy(
                scrambles = scrambles,
                copies = copies,
                title = decodedTitle,
                fmc = fmc,
                colorScheme = colorScheme
            )
        }
    }
}
