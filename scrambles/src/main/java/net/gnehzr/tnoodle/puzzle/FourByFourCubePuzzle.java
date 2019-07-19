package net.gnehzr.tnoodle.puzzle;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import java.util.Random;

import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder;
import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder.MergingMode;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;
import org.timepedia.exporter.client.Export;

@Export
public class FourByFourCubePuzzle extends CubePuzzle {
    private ThreadLocal<cs.threephase.Search> threePhaseSearcher = null;

    public FourByFourCubePuzzle() {
        super(4);
        threePhaseSearcher = new ThreadLocal<cs.threephase.Search>() {
            protected cs.threephase.Search initialValue() {
                return new cs.threephase.Search();
            };
        };
    }

    public double getInitializationStatus() {
        return cs.threephase.Edge3.initStatus();
    }

    @Override
    public PuzzleStateAndGenerator generateRandomMoves(Random r) {
        String scramble = threePhaseSearcher.get().randomState(r);
        AlgorithmBuilder ab = new AlgorithmBuilder(this, MergingMode.CANONICALIZE_MOVES);
        try {
            ab.appendAlgorithm(scramble);
        } catch (InvalidMoveException e) {
            azzert(false, new InvalidScrambleException(scramble, e));
        }
        return ab.getStateAndGenerator();
    }
}
