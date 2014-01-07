package puzzle;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import java.util.Random;
import java.util.logging.Logger;

import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder;
import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder.MergingMode;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;
import net.gnehzr.tnoodle.utils.EnvGetter;
import cs.min2phase.Search;
import cs.min2phase.Tools;
import org.timepedia.exporter.client.Export;

@Export
public class ThreeByThreeCubePuzzle extends CubePuzzle {
    private static final Logger l = Logger.getLogger(ThreeByThreeCubePuzzle.class.getName());
    private static final int THREE_BY_THREE_MAX_SCRAMBLE_LENGTH = 21;
    private static final int THREE_BY_THREE_TIMEMIN = 200; //milliseconds
    private static final int THREE_BY_THREE_TIMEOUT = 60*1000; //milliseconds

    private ThreadLocal<Search> twoPhaseSearcher = null;
    public ThreeByThreeCubePuzzle() {
        super(3);
        String newMinDistance = EnvGetter.getenv("TNOODLE_333_MIN_DISTANCE");
        if(newMinDistance != null) {
            wcaMinScrambleDistance = Integer.parseInt(newMinDistance);
        }
        twoPhaseSearcher = new ThreadLocal<Search>() {
            protected Search initialValue() {
                return new Search();
            };
        };
    }

    @Override
    protected String solveIn(PuzzleState ps, int n) {
        return solveIn(ps, n, null);
    }

    public String solveIn(PuzzleState ps, int n, String firstMoveRestriction) {
        CubeState cs = (CubeState) ps;
        boolean useTwoPhase = EnvGetter.getenv("NO_TWO_PHASE") == null;
        if(!useTwoPhase) {
            return null;
        }
        if(this.equals(getSolvedState())) {
            // TODO - apparently min2phase can't solve the solved cube
            return "";
        }
        String solution = twoPhaseSearcher.get().solution(cs.toFaceCube(), n, THREE_BY_THREE_TIMEOUT, 0, 0, firstMoveRestriction).trim();
        if("Error 7".equals(solution)) {
            // No solution exists for given depth
            return null;
        } else if(solution.startsWith("Error")) {
            // TODO - Not really sure what to do here.
            l.severe(solution + " while searching for solution to " + cs.toFaceCube());
            azzert(false);
            return null;
        }
        return solution;
    }

    public PuzzleStateAndGenerator generateRandomMoves(Random r, String firstMoveRestriction) {
        String randomState = Tools.randomCube(r);
        String scramble = twoPhaseSearcher.get().solution(randomState, THREE_BY_THREE_MAX_SCRAMBLE_LENGTH, THREE_BY_THREE_TIMEOUT, THREE_BY_THREE_TIMEMIN, Search.INVERSE_SOLUTION, firstMoveRestriction).trim();

        AlgorithmBuilder ab = new AlgorithmBuilder(this, MergingMode.CANONICALIZE_MOVES);
        try {
            ab.appendAlgorithm(scramble);
        } catch (InvalidMoveException e) {
            azzert(false, new InvalidScrambleException(scramble, e));
        }
        return ab.getStateAndGenerator();
    }
    @Override
    public PuzzleStateAndGenerator generateRandomMoves(Random r) {
        return generateRandomMoves(r, null);
    }
}
