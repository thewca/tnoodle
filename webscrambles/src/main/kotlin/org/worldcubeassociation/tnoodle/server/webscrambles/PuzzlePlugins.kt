package org.worldcubeassociation.tnoodle.server.webscrambles

import net.gnehzr.tnoodle.puzzle.*
import net.gnehzr.tnoodle.scrambles.Puzzle
import org.worldcubeassociation.tnoodle.server.Plugins
import java.util.*

object PuzzlePlugins {
    private val plugins = Plugins<Puzzle>()

    val PUZZLES: SortedMap<String, Puzzle> by lazy { getScramblers() }

    private fun getScramblers(): SortedMap<String, Puzzle> {
        plugins.register("222", "2x2x2") { TwoByTwoCubePuzzle() }
        plugins.register("333", "3x3x3") { ThreeByThreeCubePuzzle() }
        plugins.register("444", "4x4x4") { FourByFourCubePuzzle() }
        plugins.register("444fast", "4x4x4 (fast, unofficial)") { FourByFourRandomTurnsCubePuzzle() }
        plugins.register("555", "5x5x5") { CubePuzzle(5) }
        plugins.register("666", "6x6x6") { CubePuzzle(6) }
        plugins.register("777", "7x7x7") { CubePuzzle(7) }
        plugins.register("333ni", "3x3x3 no inspection") { NoInspectionThreeByThreeCubePuzzle() }
        plugins.register("444ni", "4x4x4 no inspection") { NoInspectionFourByFourCubePuzzle() }
        plugins.register("555ni", "5x5x5 no inspection") { NoInspectionFiveByFiveCubePuzzle() }
        plugins.register("333fm", "3x3x3 Fewest Moves") { ThreeByThreeCubeFewestMovesPuzzle() }
        plugins.register("pyram", "Pyraminx") { PyraminxPuzzle() }
        plugins.register("sq1", "Square-1") { SquareOnePuzzle() }
        plugins.register("sq1fast", "Square-1 (fast, unofficial)") { SquareOneUnfilteredPuzzle() }
        plugins.register("minx", "Megaminx") { MegaminxPuzzle() }
        plugins.register("clock", "Clock") { ClockPuzzle() }
        plugins.register("skewb", "Skewb") { SkewbPuzzle() }

        return plugins.plugins.toSortedMap(naturalOrder())
    }

    fun getScramblerLongName(shortName: String) = plugins.comments[shortName]
}
