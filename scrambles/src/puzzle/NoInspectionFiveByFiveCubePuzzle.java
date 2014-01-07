package puzzle;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import java.util.Random;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder;
import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder.IndexAndMove;
import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder.MergingMode;
import org.timepedia.exporter.client.Export;

@Export
public class NoInspectionFiveByFiveCubePuzzle extends CubePuzzle {
    public NoInspectionFiveByFiveCubePuzzle() {
        super(5);
    }

    @Override
    public PuzzleStateAndGenerator generateRandomMoves(Random r) {
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
            // Check if our reorientation is going to cancel with the last
            // turn of our scramble. If it does, then we just discard
            // that last turn of our scramble. This ensures we have a scramble
            // with no redundant turns, and I can't see how it could hurt the
            // quality of our scrambles to do this.
            String firstReorientMove = randomOrientation[0].toString();
            while(ab.isRedundant(firstReorientMove)) {
                azzert(discardRedundantMoves);
                IndexAndMove im = ab.findBestIndexForMove(firstReorientMove, MergingMode.CANONICALIZE_MOVES);
                ab.popMove(im.index);
            }
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
        return "555ni";
    }

    @Override
    public String getLongName() {
        return "5x5x5 no inspection";
    }
}
