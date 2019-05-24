package net.gnehzr.tnoodle.puzzle;

import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Puzzle;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

public class ThreeByThreeCubeFewestMovesTest {
    protected static final Map<String, String> OPPOSITE_FACES = new HashMap<>();

    @BeforeAll
    public static void loadOppositeMoves() {
        String faces = "URFDLB";
        String oppFaces = "DLBURF";

        // this is the most hilarious alternative to dict(zip(faces, oppFaces)) I've ever seen…
        for (int i = 0; i < faces.length(); i++) {
            OPPOSITE_FACES.put(String.valueOf(faces.charAt(i)), String.valueOf(oppFaces.charAt(i)));
        }
    }

    @Test
    public void testSomething() throws InvalidScrambleException, InvalidMoveException {
        ThreeByThreeCubeFewestMovesPuzzle threeFm = new ThreeByThreeCubeFewestMovesPuzzle();

        Collection<String> canonicalMoves = threeFm.getSolvedState().getCanonicalMovesByState().values();

        List<String> desiredCanonicalMoves = new ArrayList<>();
        List<String> modifiers = Arrays.asList("", "'", "2");

        for (char face : "RUFLDB".toCharArray()) {
            for (String d : modifiers) {
                desiredCanonicalMoves.add(face + d);
            }
        }

        Assertions.assertEquals(new HashSet<>(canonicalMoves), new HashSet<>(desiredCanonicalMoves));

        Puzzle.PuzzleState solved = threeFm.getSolvedState();

        String faces = "URFDLB";

        for (String p : modifiers) {
            for (char firstAxisRestriction : faces.toCharArray()) {
                for (char lastAxisRestriction : faces.toCharArray()) {
                    String scramble = firstAxisRestriction + p;

                    testSolveIn(threeFm, scramble, String.valueOf(firstAxisRestriction), String.valueOf(lastAxisRestriction));
                }
            }
        }

        Puzzle.PuzzleState scrambled = solved.applyAlgorithm("L' R2 U D2 L2");
        String solution = threeFm.solveIn(scrambled, 20, "L", "L");

        assertTrue(scrambled.applyAlgorithm(solution).isSolved());

        scrambled = solved.applyAlgorithm("L' R2 U D2 L2");
        solution = threeFm.solveIn(scrambled, 20, "L", "L");
        assertTrue(scrambled.applyAlgorithm(solution).isSolved());

        String[] moves = solution.split(" ");

        String firstMove = moves[0];
        String lastMove = moves[moves.length - 1];

        assertFalse(firstMove.startsWith("L"));
        assertFalse(lastMove.startsWith("L"));

        Random r = Puzzle.getSecureRandom();

        for (int i = 0; i < 10; i++) {
            String uncancelledScramble = threeFm.generateWcaScramble(r);

            AlgorithmBuilder ab = new AlgorithmBuilder(threeFm, AlgorithmBuilder.MergingMode.CANONICALIZE_MOVES);
            ab.appendAlgorithm(uncancelledScramble);

            String scramble = ab.getStateAndGenerator().generator;
            assertEquals(scramble.length(), uncancelledScramble.length());

            System.out.println(String.format("%s move 333fm scramble: %s", scramble.split(" ").length, scramble));

            assertTrue(scramble.startsWith("R' U' F"));
            assertTrue(scramble.endsWith("R' U' F"));
        }
    }

    public void testSolveIn(ThreeByThreeCubeFewestMovesPuzzle threeFm, String scramble, String firstAxisRestriction, String lastAxisRestriction) throws InvalidScrambleException, InvalidMoveException {
        // Search for a solution to a cube scrambled with scramble,
        // but require that that solution not start or end with restriction.
        Puzzle.PuzzleState solved = threeFm.getSolvedState();

        Puzzle.PuzzleState u = solved.apply(scramble);
        String solution = threeFm.solveIn(u, 20, firstAxisRestriction, lastAxisRestriction);

        System.out.println(String.format("Solution to %s (solution may not start with %s axis and may not end with %s axis): %s", scramble, firstAxisRestriction, lastAxisRestriction, solution));

        Puzzle.PuzzleState shouldBeSolved = u.applyAlgorithm(solution);
        assertTrue(shouldBeSolved.isSolved());

        String[] moves = solution.split(" ");

        String firstMove = moves[0];
        String lastMove = moves[moves.length - 1];

        // firstAxisRestriction defines an axis of turns that may not start a solution,
        // so we assert the solution's first move starts with neither
        // firstAxisRestriction, nor the face opposite firstAxisRestriction.
        assertFalse(firstMove.startsWith(firstAxisRestriction));
        assertFalse(firstMove.startsWith(OPPOSITE_FACES.get(firstAxisRestriction)));

        // Same for the last move.
        assertFalse(lastMove.startsWith(lastAxisRestriction));
        assertFalse(lastMove.startsWith(OPPOSITE_FACES.get(lastAxisRestriction)));
    }
}
