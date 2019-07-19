package net.gnehzr.tnoodle.puzzle;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import java.util.Random;
import java.util.logging.Logger;

import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder;
import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder.MergingMode;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;
import net.gnehzr.tnoodle.utils.EnvGetter;
import cs.min2phase.SearchWCA;
import cs.min2phase.Tools;
import org.timepedia.exporter.client.Export;

@Export
public class ThreeByThreeCubePuzzle extends CubePuzzle {
    private static final Logger l = Logger.getLogger(ThreeByThreeCubePuzzle.class.getName());
    private static final int THREE_BY_THREE_MAX_SCRAMBLE_LENGTH = 21;
    private static final int THREE_BY_THREE_TIMEMIN = 200; //milliseconds
    private static final int THREE_BY_THREE_TIMEOUT = 60*1000; //milliseconds

    private ThreadLocal<SearchWCA> twoPhaseSearcher = null;
    public ThreeByThreeCubePuzzle() {
        super(3);
        String newMinDistance = EnvGetter.getenv("TNOODLE_333_MIN_DISTANCE");
        if(newMinDistance != null) {
            wcaMinScrambleDistance = Integer.parseInt(newMinDistance);
        }
        twoPhaseSearcher = new ThreadLocal<SearchWCA>() {
            protected SearchWCA initialValue() {
                return new SearchWCA();
            };
        };
    }

    @Override
    protected String solveIn(PuzzleState ps, int n) {
        return solveIn(ps, n, null, null);
    }

    public String solveIn(PuzzleState ps, int n, String firstAxisRestriction, String lastAxisRestriction) {
        CubeState cs = (CubeState) ps;
        if(this.equals(getSolvedState())) {
            // TODO - apparently min2phase can't solve the solved cube
            return "";
        }
        String solution = twoPhaseSearcher.get().solution(cs.toFaceCube(), n, THREE_BY_THREE_TIMEOUT, 0, 0, firstAxisRestriction, lastAxisRestriction).trim();
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

    public PuzzleStateAndGenerator generateRandomMoves(Random r, String firstAxisRestriction, String lastAxisRestriction) {
        String randomState = Tools.randomCube(r);
        String scramble = twoPhaseSearcher.get().solution(randomState, THREE_BY_THREE_MAX_SCRAMBLE_LENGTH, THREE_BY_THREE_TIMEOUT, THREE_BY_THREE_TIMEMIN, SearchWCA.INVERSE_SOLUTION, firstAxisRestriction, lastAxisRestriction).trim();

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
        return generateRandomMoves(r, null, null);
    }
}
