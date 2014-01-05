package puzzle;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import java.util.ArrayList;
import java.util.Random;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder;
import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder.MergingMode;
import org.timepedia.exporter.client.Export;

@Export
public class NoInspectionFiveByFiveCubePuzzle extends CubePuzzle {
    public NoInspectionFiveByFiveCubePuzzle() {
        super(5);
    }

    public CubeMove[] randomUFaceMoves = new CubeMove[] {
        null,
        new CubeMove(Face.R, 1, size - 2),
        new CubeMove(Face.R, 2, size - 2),
        new CubeMove(Face.R, 3, size - 2),
        new CubeMove(Face.F, 1, size - 2),
        new CubeMove(Face.F, 3, size - 2)
    };
    public CubeMove[] randomFFaceMoves = new CubeMove[] {
        null,
        new CubeMove(Face.U, 1, size - 2),
        new CubeMove(Face.U, 2, size - 2),
        new CubeMove(Face.U, 3, size - 2)
    };
    public CubeMove[][] randomOrientationMoves = new CubeMove[randomUFaceMoves.length * randomFFaceMoves.length][];
    {
        int i = 0;
        for(CubeMove randomUFaceMove : randomUFaceMoves) {
            for(CubeMove randomFFaceMove : randomFFaceMoves) {
                ArrayList<CubeMove> moves = new ArrayList<CubeMove>();
                if(randomUFaceMove != null) {
                    moves.add(randomUFaceMove);
                }
                if(randomFFaceMove != null) {
                    moves.add(randomFFaceMove);
                }
                CubeMove[] movesArr = moves.toArray(new CubeMove[moves.size()]);
                randomOrientationMoves[i++] = movesArr;
            }
        }
    }

    @Override
    public PuzzleStateAndGenerator generateRandomMoves(Random r) {
        CubeMove[] randomOrientation = randomOrientationMoves[r.nextInt(randomOrientationMoves.length)];
        PuzzleStateAndGenerator psag = super.generateRandomMoves(r);
        psag = applyOrientation(randomOrientation, psag);
        return psag;
    }

    public PuzzleStateAndGenerator applyOrientation(CubeMove[] randomOrientation, PuzzleStateAndGenerator psag) {
        if(randomOrientation.length == 0) {
            // No reorientation required
            return psag;
        }

        // Append reorientation to scramble.
        try {
            AlgorithmBuilder ab = new AlgorithmBuilder(this, MergingMode.NO_MERGING);
            ab.appendAlgorithm(psag.generator);
            // Check if our reorientation is going to cancel with the last
            // turn of our scramble. If it does, then we just discard
            // that last turn of our scramble. This ensures we have a scramble
            // with no redundant turns, and I can't see how it could hurt the
            // quality of our scrambles to do this.
            String firstReorientMove = randomOrientation[0].toString();
            while(ab.isRedundant(firstReorientMove)) {
                ab.popMove();
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
