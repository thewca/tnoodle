package puzzle;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import java.util.Random;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder;
import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder.MergingMode;
import org.timepedia.exporter.client.Export;

@Export
public class NoInspectionFourByFourCubePuzzle extends FourByFourCubePuzzle {
    public NoInspectionFourByFourCubePuzzle() {
    }

    @Override
    public PuzzleStateAndGenerator generateRandomMoves(Random r) {
        CubeMove[][] randomOrientationMoves = getRandomOrientationMoves(size - 1);
        CubeMove[] randomOrientation = randomOrientationMoves[r.nextInt(randomOrientationMoves.length)];
        PuzzleStateAndGenerator psag = super.generateRandomMoves(r);
        psag = applyOrientation(this, randomOrientation, psag, true);
        return psag;
    }

    public static PuzzleStateAndGenerator applyOrientation(CubePuzzle puzzle, CubeMove[] randomOrientation, PuzzleStateAndGenerator psag, boolean discardRedundantMoves) {
        if(randomOrientation.length == 0) {
            // No reorientation required
            return psag;
        }

        // Append reorientation to scramble.
        try {
            AlgorithmBuilder ab = new AlgorithmBuilder(puzzle, MergingMode.NO_MERGING);
            ab.appendAlgorithm(psag.generator);
            String firstReorientMove = randomOrientation[0].toString();
            for(CubeMove cm : randomOrientation) {
                ab.appendMove(cm.toString());
            }

            psag = ab.getStateAndGenerator();
            return psag;
        } catch(InvalidMoveException e) {
            azzert(false, e);
            return null;
        }
    }

    @Override
    public String getShortName() {
        return "444ni";
    }

    @Override
    public String getLongName() {
        return "4x4x4 no inspection";
    }
}
