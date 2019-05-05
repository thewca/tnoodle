package puzzle;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;
import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzertEquals;

import java.util.Random;

import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder;
import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder.MergingMode;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;
import puzzle.TwoByTwoSolver.TwoByTwoState;
import org.timepedia.exporter.client.Export;

@Export
public class TwoByTwoCubePuzzle extends CubePuzzle {
    private static final int TWO_BY_TWO_MIN_SCRAMBLE_LENGTH = 11;

    private TwoByTwoSolver twoSolver = null;
    public TwoByTwoCubePuzzle() {
        super(2);
        wcaMinScrambleDistance = 4;
        twoSolver = new TwoByTwoSolver();
    }

    @Override
    public PuzzleStateAndGenerator generateRandomMoves(Random r) {
        TwoByTwoState state = twoSolver.randomState(r);
        String scramble = twoSolver.generateExactly(state, TWO_BY_TWO_MIN_SCRAMBLE_LENGTH);
        azzertEquals(scramble.split(" ").length, TWO_BY_TWO_MIN_SCRAMBLE_LENGTH);

        AlgorithmBuilder ab = new AlgorithmBuilder(this, MergingMode.CANONICALIZE_MOVES);
        try {
            ab.appendAlgorithm(scramble);
        } catch (InvalidMoveException e) {
            azzert(false, new InvalidScrambleException(scramble, e));
        }
        return ab.getStateAndGenerator();
    }

    protected String solveIn(PuzzleState ps, int n) {
        CubeState cs = (CubeState) ps;
        String solution = twoSolver.solveIn(cs.toTwoByTwoState(), n);
        return solution;
    }
}
