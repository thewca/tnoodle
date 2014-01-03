package puzzle;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import java.util.Random;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import org.timepedia.exporter.client.Export;

@Export
public class NoInspectionFiveByFiveCubePuzzle extends CubePuzzle {
    public NoInspectionFiveByFiveCubePuzzle() {
        super(5);
    }

    @Override
    public PuzzleStateAndGenerator generateRandomMoves(Random r) {
        PuzzleStateAndGenerator psag = super.generateRandomMoves(r);
        String scramble = psag.generator;
        scramble += " 3Rw2 3Bw2";//<<<
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
        return "555ni";
    }

    @Override
    public String getLongName() {
        return "5x5x5 no inspection";
    }
}
