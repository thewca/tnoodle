package puzzle;

import static puzzle.NoInspectionFiveByFiveCubePuzzle.applyOrientation;

import java.util.Random;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;
import org.timepedia.exporter.client.Export;

@Export
public class NoInspectionThreeByThreeCubePuzzle extends ThreeByThreeCubePuzzle {
    public NoInspectionThreeByThreeCubePuzzle() {
        super();
    }

    @Override
    public PuzzleStateAndGenerator generateRandomMoves(Random r) {
        CubeMove[] randomOrientation = randomOrientationMoves[r.nextInt(randomOrientationMoves.length)];
        String firstMoveRestriction;
        if(randomOrientation.length > 0) {
            Face restrictedFace = randomOrientation[0].face;
            // Restrictions are for an entire axis, so this will also
            // prevent the oppossite of restrictedFace from being the first
            // move of our solution. This ensures that randomOrientation will
            // never been redundant with our scramble.
            firstMoveRestriction = restrictedFace.toString();
        } else {
            firstMoveRestriction = null;
        }
        PuzzleStateAndGenerator psag = super.generateRandomMoves(r, firstMoveRestriction);
        psag = applyOrientation(this, randomOrientation, psag, false);
        return psag;
    }

    @Override
    public String getShortName() {
        return "333ni";
    }

    @Override
    public String getLongName() {
        return "3x3x3 no inspection";
    }
}
