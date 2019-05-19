package net.gnehzr.tnoodle.puzzle;

import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.utils.Utils;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

public class NoInspectionThreeByThreeTest {
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
    public void testSomething() throws InvalidMoveException, InvalidScrambleException {
        Puzzle twos = new TwoByTwoCubePuzzle();
        Collection<String> canonicalMoves = twos.getSolvedState().getCanonicalMovesByState().values();

        List<String> desiredCanonicalMoves = new ArrayList<>();
        List<String> modifiers = Arrays.asList("", "'", "2");

        for (char face : "RUF".toCharArray()) {
            for (String d : modifiers) {
                desiredCanonicalMoves.add(face + d);
            }
        }

        assertEquals(new HashSet<>(canonicalMoves), new HashSet<>(desiredCanonicalMoves));

        NoInspectionThreeByThreeCubePuzzle threes = new NoInspectionThreeByThreeCubePuzzle();
        Puzzle.PuzzleState solved = threes.getSolvedState();

        String faces = "URFDLB";

        for (String p : modifiers) {
            for (char face : faces.toCharArray()) {
                String actFace = String.valueOf(face);
                String oppositeFace = OPPOSITE_FACES.get(actFace);

                List<String> restrictions = Arrays.asList(actFace, oppositeFace);

                for (String axisRestriction : restrictions) {
                    String scramble = axisRestriction + p;

                    testSolveIn(threes, scramble, axisRestriction);
                }
            }
        }

        Puzzle.PuzzleState scrambled = solved.applyAlgorithm("L' R2 U D2 L2");
        String solution = threes.solveIn(scrambled, 20, "L", null);

        assertFalse(solution.startsWith("L"));
        assertTrue(scrambled.applyAlgorithm(solution).isSolved());

        // min2phase can look at the inverse of a given cube and try to solve it.
        // This can screw up restricting the first turn, however. Check that
        // min2phase handles this correctly. This particular
        // scramble and restriction caused tickled this behavior originally.
        scrambled = solved.applyAlgorithm("F D B L' U L' F D' L2 D L' B2 D F2 U B2 R2 U D2 L2");
        solution = threes.solveIn(scrambled, 20, "L", null);

        assertFalse(solution.startsWith("L"));
        assertFalse(solution.startsWith("R"));

        assertTrue(scrambled.applyAlgorithm(solution).isSolved());

        Random r = Utils.getSeededRandom();

        for (int i = 0; i < 10; i++) {
            System.out.println(threes.generateWcaScramble(r));
        }
    }

    public void testSolveIn(NoInspectionThreeByThreeCubePuzzle threeNi, String scramble, String axisRestriction) throws InvalidScrambleException, InvalidMoveException {
        // Search for a solution to a cube scrambled with scramble,
        // but require that that solution not start with restriction
        Puzzle.PuzzleState solved = threeNi.getSolvedState();

        Puzzle.PuzzleState u = solved.apply(scramble);
        String solution = threeNi.solveIn(u, 20, axisRestriction, null);

        System.out.println(String.format("Solution to %s (restriction %s): %s", scramble, axisRestriction, solution));

        // restriction defines an axis of turns that may not start a solution,
        // so we assert the solution starts with neither restriction, nor
        // the face opposite restriction.
        assertFalse(solution.startsWith(axisRestriction));
        assertFalse(solution.startsWith(OPPOSITE_FACES.get(axisRestriction)));

        Puzzle.PuzzleState shouldBeSolved = u.applyAlgorithm(solution);
        assert shouldBeSolved.isSolved();
    }
}
