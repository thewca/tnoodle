package net.gnehzr.tnoodle.puzzle;

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
        // For fewest moves, we want to minimize the probability that the
        // scramble has useful "stuff" in it. The problem with conventional
        // Kociemba 2 phase solutions is that there's a pretty obvious
        // orientation step, which competitors might intentionally (or even
        // accidentally!) use in their solution. To lower the probability of this happening,
        // we intentionally generate dumbed down solutions.

        // We eventually decided to go with "Tom2", which is described by Tom
        // Rokicki (https://groups.google.com/d/msg/wca-admin/vVnuhk92hqg/P5oaJJQjDQAJ):

        // START TOM MESSAGE
        // If we're going this direction, and the exact length isn't critical, why not combine a bunch of the
        // ideas we've seen so far into something this simple:
        //
        // 1. Fix a set of prefix/suffix moves, say, U F R / U F R.
        // 2. For a given position p, find *any* solution where that solution prefixed and suffixed with
        //    the appropriate moves is canonical.
        //
        // That's it.  So we generate a random position, then find any two-phase solution g such
        // that U F R g U F R is a canonical sequence, and that's our FMC scramble.
        //
        // The prefix/suffix will be easily recognizable and memorable and ideally finger-trick
        // friendly (if it matters).
        //
        // Someone wanting to practice speed FMC (hehe) can make up their own scrambles just
        // by manually doing the prefix/suffix thing on any existing scrambler.
        //
        // It does not perturb the uniformity of the random position selection.
        //
        // It's simple enough that it is less likely to suffer from subtle defects due to the
        // perturbation of the two-phase search (unlikely those these may be).
        //
        // And even if the two-phase solution is short, adding U F R to the front and back makes it
        // no longer be unusually short (with high probability).
        // END TOM MESSAGE

        // Michael Young suggested using R' U' F as our padding (https://groups.google.com/d/msg/wca-admin/vVnuhk92hqg/EzQfG_vPBgAJ):

        // START MICHAEL MESSSAGE
        // I think that something more like R' U' F (some sequence that
        // involves a quarter-turn on all three "axes") is better because it
        // guarantees at least one bad edge in every orientation; with EO-first
        // options becoming more popular, "guaranteeing" that solving EO
        // optimally can't be derived from the scramble is a nice thing to
        // have, I think.  (Someone who was both unscrupulous and lucky could
        // see that R' F R doesn't affect U2/D2 EO, and therefore find out how
        // to solve EO by looking at the solution ignoring the R' F R.  That
        // being said, it still does change things, and I like how
        // finger-tricky/reversible the current prefix is.)  Just my two cents,
        // 'tho.
        // END MICHAEL MESSSAGE
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
        // sol_n' doesn't cancel with the first move of scramblePrefix:
        String solutionLastAxisRestriction = scramblePrefix[scramblePrefix.length - 1].substring(0, 1);
        // and we need to make sure that sol_0' doesn't cancel with the first move of
        // scrambleSuffix:
        String solutionFirstAxisRestriction = scrambleSuffix[0].substring(0, 1);
        PuzzleStateAndGenerator psag = super.generateRandomMoves(r, solutionFirstAxisRestriction, solutionLastAxisRestriction);
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
