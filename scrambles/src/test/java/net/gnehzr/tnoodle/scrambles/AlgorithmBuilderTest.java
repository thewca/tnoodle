package net.gnehzr.tnoodle.scrambles;

import net.gnehzr.tnoodle.puzzle.CubePuzzle;
import net.gnehzr.tnoodle.utils.BadLazyClassDescriptionException;
import net.gnehzr.tnoodle.utils.LazyInstantiator;
import net.gnehzr.tnoodle.utils.LazyInstantiatorException;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class AlgorithmBuilderTest {
    @Test
    void testRedundantMoves() throws LazyInstantiatorException, InvalidMoveException, IOException, BadLazyClassDescriptionException {
        // This test doesn't really belong here, but I don't have a better
        // place for it right now.
        Puzzle sixes = new CubePuzzle(6);
        Set<String> moves = sixes.getSolvedState().getScrambleSuccessors().keySet();

        assertFalse(moves.contains("3Bw"));
        assertFalse(moves.contains("3Lw"));
        assertFalse(moves.contains("3Dw"));

        Map<String, LazyInstantiator<Puzzle>> lazyScramblers = PuzzlePlugins.getScramblers();

        for (Map.Entry<String, LazyInstantiator<Puzzle>> lazyEntry : lazyScramblers.entrySet()) {
            String puzzle = lazyEntry.getKey();
            LazyInstantiator<Puzzle> lazyScrambler = lazyEntry.getValue();

            System.out.println("Testing redundant moves on " + puzzle);
            Puzzle scrambler = lazyScrambler.cachedInstance();

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
