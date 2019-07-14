package net.gnehzr.tnoodle;

import static org.junit.jupiter.api.Assertions.*;

import java.io.IOException;
import java.lang.annotation.Annotation;
import java.util.HashMap;
import java.util.Random;
import java.util.SortedMap;
import java.util.logging.Logger;

import kotlin.Lazy;
import net.gnehzr.tnoodle.plugins.PuzzlePlugins;
import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder;
import net.gnehzr.tnoodle.scrambles.AlgorithmBuilder.MergingMode;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.scrambles.Puzzle.PuzzleState;
import net.gnehzr.tnoodle.scrambles.ScrambleCacher;
import net.gnehzr.tnoodle.scrambles.ScrambleCacherListener;
import net.gnehzr.tnoodle.puzzle.ClockPuzzle;
import net.gnehzr.tnoodle.puzzle.ClockPuzzle.ClockState;
import net.gnehzr.tnoodle.puzzle.SquareOnePuzzle;
import net.gnehzr.tnoodle.puzzle.CubePuzzle;
import net.gnehzr.tnoodle.puzzle.CubePuzzle.CubeState;
import net.gnehzr.tnoodle.puzzle.ThreeByThreeCubePuzzle;
import net.gnehzr.tnoodle.puzzle.PyraminxPuzzle;
import net.gnehzr.tnoodle.puzzle.PyraminxPuzzle.PyraminxState;
import net.gnehzr.tnoodle.puzzle.PyraminxSolver;
import net.gnehzr.tnoodle.puzzle.PyraminxSolver.PyraminxSolverState;
import net.gnehzr.tnoodle.puzzle.MegaminxPuzzle;
import net.gnehzr.tnoodle.puzzle.TwoByTwoSolver;
import net.gnehzr.tnoodle.puzzle.TwoByTwoSolver.TwoByTwoState;
import org.junit.jupiter.api.Test;
import org.timepedia.exporter.client.Export;
import org.timepedia.exporter.client.Exportable;

public class HugeScrambleTest {
    private static final Logger l = Logger.getLogger(HugeScrambleTest.class.getName());
    
    private static final Random r = Puzzle.getSecureRandom();
    
    static class LockHolder extends Thread {
        public LockHolder() {
            setDaemon(true);
        }

        private Object o;
        public void setObjectToLock(Object o) {
            synchronized(this) {
                this.o = o;
                if(isAlive()) {
                    notify();
                } else {
                    start();
                }
            }
            try {
                Thread.sleep(100); // give the locker thread a chance to grab the lock
            } catch(InterruptedException e) {
                e.printStackTrace();
            }
        }
        @Override
        public synchronized void run() {
            while(o != null) {
                synchronized(o) {
                    System.out.println("GOT LOCK " + o);
                    Object locked = o;
                    while(o == locked) {
                        try {
                            wait();
                        } catch (InterruptedException e) {}
                    }
                }
            }
        }
    }

    @Test
    public void testScrambleFiltering() throws InvalidScrambleException, IOException {
        System.out.println("Testing scramble filtering");

        int SCRAMBLE_COUNT = 10;

        SortedMap<String, Lazy<Puzzle>> lazyScramblers = PuzzlePlugins.INSTANCE.getPUZZLES();
        for(String puzzle : lazyScramblers.keySet()) {
            Lazy<Puzzle> lazyScrambler = lazyScramblers.get(puzzle);
            final Puzzle scrambler = lazyScrambler.getValue();
            for(int count = 0; count < SCRAMBLE_COUNT; count++){
                PuzzleState state = scrambler.getSolvedState().applyAlgorithm(scrambler.generateWcaScramble(r));
                assertSame(state.solveIn(scrambler.getWcaMinScrambleDistance() - 1), null);
            }
        }
    }

    @Test
    public void testSolveIn() throws InvalidScrambleException {
        int SCRAMBLE_COUNT = 10;
        int SCRAMBLE_LENGTH = 4;

        SortedMap<String, Lazy<Puzzle>> lazyScramblers = PuzzlePlugins.INSTANCE.getPUZZLES();

        for(String puzzle : lazyScramblers.keySet()) {
            Lazy<Puzzle> lazyScrambler = lazyScramblers.get(puzzle);
            final Puzzle scrambler = lazyScrambler.getValue();

            System.out.println("Testing " + puzzle);
            
            // Test solving the solved state
            String solution = scrambler.getSolvedState().solveIn(0);
            assertEquals("", solution);

            for(int count = 0; count < SCRAMBLE_COUNT; count++) {
                System.out.print("Scramble ["+(count+1)+"/"+SCRAMBLE_COUNT+"]: ");
                PuzzleState state = scrambler.getSolvedState();
                for(int i = 0; i < SCRAMBLE_LENGTH; i++){
                    HashMap<String, ? extends PuzzleState> successors = state.getSuccessorsByName();
                    String move = Puzzle.choose(r, successors.keySet());
                    System.out.print(" "+move);
                    state = successors.get(move);
                }
                System.out.print("...");
                solution = state.solveIn(SCRAMBLE_LENGTH);
                assertNotNull(solution, "Puzzle "+scrambler.getShortName()+" solveIn method failed!");
                System.out.println("Found: "+solution);
                state = state.applyAlgorithm(solution);
                assertTrue(state.isSolved(), "Solution was not correct");
            }
        }
    }

    @Test
    public void testThreads() throws InvalidScrambleException {
        LockHolder lh = new LockHolder();

        int SCRAMBLE_COUNT = 10;
        boolean drawScramble = true;

        SortedMap<String, Lazy<Puzzle>> lazyScramblers = PuzzlePlugins.INSTANCE.getPUZZLES();

        for(String puzzle : lazyScramblers.keySet()) {
            Lazy<Puzzle> lazyScrambler = lazyScramblers.get(puzzle);
            final Puzzle scrambler = lazyScrambler.getValue();

            System.out.println("Testing " + puzzle);

            // It's easy to get this wrong (read about Arrays.hashCode vs Arrays.deepHashCode).
            // This is just a sanity check.
            assertEquals(scrambler.getSolvedState().hashCode(), scrambler.getSolvedState().hashCode());

            // Generating a scramble
            System.out.println("Generating a " + puzzle + " scramble");
            String scramble;
            lh.setObjectToLock(scrambler);
            scramble = scrambler.generateScramble();

            // Drawing that scramble
            System.out.println("Drawing " + scramble);
            scrambler.drawScramble(scramble, null);

            // Scramblers should support "null" as the empty scramble
            scrambler.drawScramble(null, null);

            System.out.println("Generating & drawing 2 sets of " + SCRAMBLE_COUNT + " scrambles simultaneously." +
                                " This is meant to shake out threading problems in scramblers.");
            final Object[] o = new Object[0];
            ScrambleCacherListener cacherStopper = src -> {
                System.out.println(Thread.currentThread() + " " + src.getAvailableCount() + " / " + src.getCacheSize());
                if(src.getAvailableCount() == src.getCacheSize()) {
                    src.stop();
                    synchronized(o) {
                        o.notify();
                    }
                }
            };
            ScrambleCacher c1 = new ScrambleCacher(scrambler, SCRAMBLE_COUNT, drawScramble, cacherStopper);
            ScrambleCacher c2 = new ScrambleCacher(scrambler, SCRAMBLE_COUNT, drawScramble, cacherStopper);
            while(c1.isRunning() || c2.isRunning()) {
                synchronized(o) {
                    try {
                        o.wait();
                    } catch(InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }

        }
        lh.setObjectToLock(null);
        System.out.println("\nTest passed!");
    }

    @Test
    public void testNames() {
        SortedMap<String, Lazy<Puzzle>> lazyScramblers = PuzzlePlugins.INSTANCE.getPUZZLES();

        // Check that the names by which the scramblers refer to themselves
        // is the same as the names by which we refer to them in the plugin definitions file.
        for(String shortName : lazyScramblers.keySet()) {
            String longName = PuzzlePlugins.INSTANCE.getScramblerLongName(shortName);
            Lazy<Puzzle> lazyScrambler = lazyScramblers.get(shortName);
            Puzzle scrambler = lazyScrambler.getValue();
            
            assertEquals(shortName, scrambler.getShortName());
            assertEquals(longName, scrambler.getLongName());

            System.out.println(Exportable.class + " isAssignableFrom " + scrambler.getClass());
            assertTrue(Exportable.class.isAssignableFrom(scrambler.getClass()));
            Annotation[] annotations = scrambler.getClass().getAnnotations();
            boolean foundExport = false;
            for(Annotation annotation : annotations) {
                if(Export.class.isAssignableFrom(annotation.annotationType())) {
                    foundExport = true;
                    break;
                }
            }
            assertTrue(foundExport);
        }
    }

    @Test
    public void testClockPuzzle() throws InvalidScrambleException {
        ClockPuzzle clock = new ClockPuzzle();
        ClockState state = (ClockState)clock.getSolvedState();
        state = (ClockState)state.applyAlgorithm("ALL2+ y2 ALL1-"); // This scramble is breaking the solveIn method...
        String solution = state.solveIn(3);
        if(solution == null) {
            System.out.println("No solution");
        } else {
            System.out.println(solution);
        }
    }
    
    @Test
    public void testCubePuzzle() throws InvalidScrambleException, InvalidMoveException {
        testCubeNormalization();
        testTwosConverter();
        testTwosSolver();
    }

    @Test
    public void testCubeNormalization() throws InvalidScrambleException, InvalidMoveException {
        CubePuzzle fours = new CubePuzzle(4);
        CubeState solved = fours.getSolvedState();

        CubeState state = (CubeState) solved.applyAlgorithm("Rw Lw'");
        CubeState normalizedState = state.getNormalized();
        CubeState normalizedSolvedState = solved.getNormalized();
        assertEquals(normalizedState, normalizedSolvedState);
        assertEquals(normalizedState.hashCode(), normalizedSolvedState.hashCode());
        
        state = (CubeState) solved.applyAlgorithm("Uw Dw'");
        normalizedState = state.getNormalized();
        assertEquals(normalizedState, normalizedSolvedState);
        
        CubePuzzle threes = new ThreeByThreeCubePuzzle();

        solved = threes.getSolvedState();
        CubeState bDone = (CubeState) solved.apply("B");
        CubeState fwDone = (CubeState) solved.apply("Fw");
        assertTrue(bDone.equalsNormalized(fwDone));

        AlgorithmBuilder ab3 = new AlgorithmBuilder(threes, MergingMode.CANONICALIZE_MOVES);
        String alg = "D2 U' L2 B2 F2 D B2 U' B2 F D' F U' R F2 L2 D' B D F'";
        ab3.appendAlgorithm(alg);
        assertEquals(ab3.toString(), alg);
        
        for(int depth = 0; depth < 100; depth++) {
            state = Puzzle.choose(r, state.getSuccessorsByName().values());
            normalizedState = state.getNormalized();
            PuzzleState rotatedState = state.applyAlgorithm("Uw Dw'").getNormalized();
            assertEquals(normalizedState, rotatedState);
        }
    }

    @Test
    public void testAlgorithmBuilder() throws InvalidMoveException {
        System.out.println("Testing algorithm builder");

        CubePuzzle fours = new CubePuzzle(4);
        AlgorithmBuilder ab4 = new AlgorithmBuilder(fours, MergingMode.CANONICALIZE_MOVES);
        String ogAlg = "Rw Lw";
        ab4.appendAlgorithm(ogAlg);
        String shortenedAlg = ab4.toString();
        System.out.println(ogAlg + " -> " + shortenedAlg);
        String[] shortenedAlgSplit = AlgorithmBuilder.splitAlgorithm(shortenedAlg);
        assertEquals(shortenedAlgSplit.length, 1);

        Puzzle sq1 = new SquareOnePuzzle();
        AlgorithmBuilder abSq1;

        abSq1 = new AlgorithmBuilder(sq1, MergingMode.CANONICALIZE_MOVES);
        abSq1.appendAlgorithm("(1,0) (0,1)");
        assertEquals(abSq1.toString(), "(1,1)");
        
        abSq1 = new AlgorithmBuilder(sq1, MergingMode.CANONICALIZE_MOVES);
        abSq1.appendAlgorithm("(0,1) (1,1)");
        assertEquals(abSq1.toString(), "(1,2)");

        CubePuzzle fives = new CubePuzzle(5);
        AlgorithmBuilder ab5 = new AlgorithmBuilder(fives, MergingMode.NO_MERGING);
        String alg = "U R 4Rw'";
        ab5.appendAlgorithm(alg);
        assertEquals(alg, ab5.toString());
    }

    @Test
    public void testTwosConverter() throws InvalidMoveException {
        int orient = 0;
        int permute = 0;

        int MOVE_R = 3;
        orient = TwoByTwoSolver.moveOrient[orient][MOVE_R];
        permute = TwoByTwoSolver.movePerm[permute][MOVE_R];

        CubePuzzle twos = new CubePuzzle(2);
        CubeState state = (CubeState) twos.getSolvedState().apply("R");
        TwoByTwoState twoByTwoState = state.toTwoByTwoState();

        assertEquals(twoByTwoState.orientation, orient);
        assertEquals(twoByTwoState.permutation, permute);

        TwoByTwoSolver twoByTwoSolver = new TwoByTwoSolver();
        assertEquals(twoByTwoSolver.solveIn(twoByTwoState, 1), "R'");

        int MOVE_R_PRIME = 5;
        orient = TwoByTwoSolver.moveOrient[orient][MOVE_R_PRIME];
        permute = TwoByTwoSolver.movePerm[permute][MOVE_R_PRIME];
        assertEquals(orient, 0);
        assertEquals(permute, 0);
    }

    @Test
    public void testTwosSolver() throws InvalidScrambleException {
        CubePuzzle twos = new CubePuzzle(2);
        CubeState state = (CubeState) twos.getSolvedState();
        String solution = state.solveIn(0);
        assertEquals(solution, "");

        state = (CubeState) state.applyAlgorithm("R2 B2 F2");
        solution = state.solveIn(1);
        assertNotEquals(solution, null);
        state = (CubeState) state.applyAlgorithm(solution);
        assertTrue(state.isSolved());
    }

    @Test
    public void testPyraConverter() throws InvalidMoveException {
        int SCRAMBLE_COUNT = 1000;
        int SCRAMBLE_LENGTH = 20;

        int edgePerm = 0;
        int edgeOrient = 0;
        int cornerOrient = 0;
        int tips = 0;
        final String[] moveToString = {"U", "U'", "L", "L'", "R", "R'", "B", "B'"};

        PyraminxPuzzle pyra = new PyraminxPuzzle();
        PyraminxState state = (PyraminxState) pyra.getSolvedState();
        PyraminxSolverState sstate = state.toPyraminxSolverState();
        assertEquals(sstate.edgePerm, edgePerm);
        assertEquals(sstate.edgeOrient, edgeOrient);
        assertEquals(sstate.cornerOrient, cornerOrient);
        assertEquals(sstate.tips, tips);

        for (int i = 0; i < SCRAMBLE_COUNT; i++){
            System.out.println(" Scramble ["+i+"/"+SCRAMBLE_COUNT+"]");
            edgePerm = 0;
            edgeOrient = 0;
            cornerOrient = 0;
            state = (PyraminxState) pyra.getSolvedState();
            for (int j = 0; j < SCRAMBLE_LENGTH; j++){
                int move = r.nextInt(moveToString.length);
                edgePerm = PyraminxSolver.moveEdgePerm[edgePerm][move];
                edgeOrient = PyraminxSolver.moveEdgeOrient[edgeOrient][move];
                cornerOrient = PyraminxSolver.moveCornerOrient[cornerOrient][move];
                state = (PyraminxState) state.apply(moveToString[move]);
            }
            sstate = state.toPyraminxSolverState();

            assertEquals(sstate.edgePerm, edgePerm);
            assertEquals(sstate.edgeOrient, edgeOrient);
            assertEquals(sstate.cornerOrient, cornerOrient);
        }
        System.out.println();
    }

    @Test
    public void testMega() throws InvalidScrambleException {
        MegaminxPuzzle megaminx = new MegaminxPuzzle();
        PuzzleState solved = megaminx.getSolvedState();

        String spinL = "R++ L2'";
        String spinU = "D++ U2'";
        PuzzleState state = solved.applyAlgorithm(spinL).applyAlgorithm(spinU).applyAlgorithm(spinU).applyAlgorithm(spinL).applyAlgorithm(spinL).applyAlgorithm(spinL);
        state = state.applyAlgorithm(spinU);
        assertTrue(state.equalsNormalized(solved));
    }

    @Test
    public void benchmarking() throws InvalidScrambleException {

        // Analyze the 3x3x3 solver.
        int THREE_BY_THREE_SCRAMBLE_COUNT = 100;
        int THREE_BY_THREE_MAX_SCRAMBLE_LENGTH = 21;
        int THREE_BY_THREE_TIMEMIN = 0; //milliseconds
        int THREE_BY_THREE_TIMEOUT = 5*1000; //milliseconds

        cs.min2phase.Search threeSolver = new cs.min2phase.Search();
        cs.min2phase.Search.init();
        l.info("Searching for " + THREE_BY_THREE_SCRAMBLE_COUNT + " random 3x3x3 cubes in less that " + THREE_BY_THREE_MAX_SCRAMBLE_LENGTH + " moves");
        long startMillis = System.currentTimeMillis();

        for(int i = 0; i < THREE_BY_THREE_SCRAMBLE_COUNT; i++){
            threeSolver.solution(cs.min2phase.Tools.randomCube(r), THREE_BY_THREE_MAX_SCRAMBLE_LENGTH, THREE_BY_THREE_TIMEOUT, THREE_BY_THREE_TIMEMIN, cs.min2phase.Search.INVERSE_SOLUTION);
        }
        long endMillis = System.currentTimeMillis();
        l.info("Finished after " + (endMillis - startMillis) + "ms");


        // How long does it takes to test if a puzzle is solvable in <= 1 move?
        int SCRAMBLE_COUNT = 100;
        SortedMap<String, Lazy<Puzzle>> lazyScramblers = PuzzlePlugins.INSTANCE.getPUZZLES();
        
        for(String puzzle : lazyScramblers.keySet()) {
            Lazy<Puzzle> lazyScrambler = lazyScramblers.get(puzzle);
            final Puzzle scrambler = lazyScrambler.getValue();
            
            l.info("Are " + THREE_BY_THREE_SCRAMBLE_COUNT + " " + puzzle + " more than one move away from solved?");
            startMillis = System.currentTimeMillis();
            PuzzleState solved = scrambler.getSolvedState();
            for(int count = 0; count < SCRAMBLE_COUNT; count++){
                String scramble = scrambler.generateWcaScramble(r);
                System.out.println("Searching for solution in <= 1 move to " + scramble);
                PuzzleState state = solved.applyAlgorithm(scramble);
                String solution = state.solveIn(1);
                assertEquals(solution, null);
            }
            endMillis = System.currentTimeMillis();
            l.info("Finished after " + (endMillis - startMillis) + "ms");
        }
    }
}
