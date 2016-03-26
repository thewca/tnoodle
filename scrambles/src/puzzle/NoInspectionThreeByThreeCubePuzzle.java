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
        CubeMove[][] randomOrientationMoves = getRandomOrientationMoves(size / 2);
        CubeMove[] randomOrientation = randomOrientationMoves[r.nextInt(randomOrientationMoves.length)];
        String firstAxisRestriction;
        if(randomOrientation.length > 0) {
            Face restrictedFace = randomOrientation[0].face;
            // Restrictions are for an entire axis, so this will also
            // prevent the opposite of restrictedFace from being the first
            // move of our solution. This ensures that randomOrientation will
            // never be redundant with our scramble.
            firstAxisRestriction = restrictedFace.toString();
        } else {
            firstAxisRestriction = null;
        }
        String lastAxisRestriction = null;
        PuzzleStateAndGenerator psag = super.generateRandomMoves(r, firstAxisRestriction, lastAxisRestriction);
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
