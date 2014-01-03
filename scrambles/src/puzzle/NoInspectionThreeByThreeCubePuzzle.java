package puzzle;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import java.util.Random;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import org.timepedia.exporter.client.Export;

@Export
public class NoInspectionThreeByThreeCubePuzzle extends ThreeByThreeCubePuzzle {
    public NoInspectionThreeByThreeCubePuzzle() {
        super();
    }

    @Override
    public PuzzleStateAndGenerator generateRandomMoves(Random r) {
        PuzzleStateAndGenerator psag = super.generateRandomMoves(r);
        String scramble = psag.generator;
        scramble += " Rw Bw";//<<<
        CubeState state = getSolvedState();
        try {
            state = (CubeState) state.applyAlgorithm(scramble);
        } catch(InvalidScrambleException e) {
            azzert(false, e);
        }

        psag.generator = scramble;
        psag.state = state;
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
