package puzzle;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import java.util.Random;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder;
import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder.MergingMode;
import net.gnehzr.tnoodle.scrambles.PuzzleStateAndGenerator;
import org.timepedia.exporter.client.Export;

@Export
public class ThreeByThreeCubeFewestMovesPuzzle extends ThreeByThreeCubePuzzle {
    public ThreeByThreeCubeFewestMovesPuzzle() {
        super();
    }

    @Override
    public PuzzleStateAndGenerator generateRandomMoves(Random r) {
        // TODO - explain tom2 here
        String[] scramblePrefix = AlgorithmBuilder.splitAlgorithm("R' U' F");
        String[] scrambleSuffix = AlgorithmBuilder.splitAlgorithm("R' U' F");

        // super.generateRandomMoves(...) will pick a random state S and find a solution:
        //  solution = sol_0, sol_1, ..., sol_n-1, sol_n
        // We then invert that solution to create a scramble:
        //  scramble = sol_n' + sol_(n-1)' + ... + sol_1' + sol_0'
        // We then prefix the scramble with scramblePrefix and suffix it with
        // scrambleSuffix to create paddedScramble:
        //  paddedScramble = scramblePrefix + scramble + scrambleSuffix
        //  paddedScramble = scramblePrefix + (sol_n' + sol_(n-1)' + ... + sol_1' + sol_0') + scrambleSuffix
        //
        // We don't want any moves to cancel here, so we need to make sure that
        // sol_n' doesn't cancel with the last move of scramblePrefix:
        String solutionLastAxisRestriction = scrambleSuffix[scrambleSuffix.length - 1].substring(0, 1);
        // and we need to make sure that sol_0' doesn't cancel with the first move of
        // scrambleSuffix:
        String solutionFirstAxisRestriction = scramblePrefix[0].substring(0, 1);
        PuzzleStateAndGenerator psag = super.generateRandomMoves(r, solutionLastAxisRestriction, solutionFirstAxisRestriction);
        AlgorithmBuilder ab = new AlgorithmBuilder(this, MergingMode.NO_MERGING);
        try {
            ab.appendAlgorithms(scramblePrefix);
            ab.appendAlgorithm(psag.generator);
            ab.appendAlgorithms(scrambleSuffix);
        } catch(InvalidMoveException e) {
            azzert(false, e);
            return null;
        }
        return ab.getStateAndGenerator();
    }

    @Override
    public String getShortName() {
        return "333fm";
    }

    @Override
    public String getLongName() {
        return "3x3x3 Fewest Moves";
    }
}
