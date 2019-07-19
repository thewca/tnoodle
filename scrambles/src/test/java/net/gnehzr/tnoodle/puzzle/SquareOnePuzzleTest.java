package net.gnehzr.tnoodle.puzzle;

import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;
import net.gnehzr.tnoodle.utils.Utils;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class SquareOnePuzzleTest {
    @Test
    public void testSomething() throws InvalidMoveException {
        Puzzle sq1 = new SquareOnePuzzle();
        AlgorithmBuilder ab = new AlgorithmBuilder(sq1, AlgorithmBuilder.MergingMode.CANONICALIZE_MOVES);

        assertEquals(ab.getTotalCost(), 0);

        ab.appendMove("(1,0)");
        assertEquals(ab.getTotalCost(), 1);

        ab.appendMove("(2,0)");
        assertEquals(ab.getTotalCost(), 1);

        ab.appendMove("(0,-1)");
        assertEquals(ab.getTotalCost(), 1);

        ab.appendMove("/");
        assertEquals(ab.getTotalCost(), 2);

        ab.appendMove("/");
        assertEquals(ab.getTotalCost(), 1);

        PuzzleStateAndGenerator stateAndGenerator = ab.getStateAndGenerator();
        Puzzle.PuzzleState state = stateAndGenerator.state;

        String solution = state.solveIn(1);
        assertEquals(solution, "(-3,1)");

        solution = state.solveIn(2);
        assertEquals(solution, "(-3,1)");

        System.out.println(sq1.generateWcaScramble(Utils.getSeededRandom()));
    }
}
