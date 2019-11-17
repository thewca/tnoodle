package net.gnehzr.tnoodle.scrambles;

import net.gnehzr.tnoodle.TestPuzzles;
import net.gnehzr.tnoodle.puzzle.CubePuzzle;

import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Set;
import java.util.function.Supplier;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class AlgorithmBuilderTest {
    @Test
    void testRedundantMoves() throws InvalidMoveException {
        // This test doesn't really belong here, but I don't have a better
        // place for it right now.
        Puzzle sixes = new CubePuzzle(6);
        Set<String> moves = sixes.getSolvedState().getScrambleSuccessors().keySet();

        assertFalse(moves.contains("3Bw"));
        assertFalse(moves.contains("3Lw"));
        assertFalse(moves.contains("3Dw"));

        Map<String, Supplier<Puzzle>> lazyScramblers = TestPuzzles.getTestablePuzzles();

        for (Map.Entry<String, Supplier<Puzzle>> lazyEntry : lazyScramblers.entrySet()) {
            String puzzle = lazyEntry.getKey();
            Puzzle scrambler = lazyEntry.getValue().get();

            System.out.println("Testing redundant moves on " + puzzle);

            for (String move : scrambler.getSolvedState().getSuccessorsByName().keySet()) {
                AlgorithmBuilder ab = new AlgorithmBuilder(scrambler, AlgorithmBuilder.MergingMode.NO_MERGING);
                ab.appendAlgorithm(move);

                // Right now, it is true to say that for every single WCA puzzle,
                // applying the same move twice is redundant.
                assertTrue(ab.isRedundant(move));
            }
        }
    }
}
