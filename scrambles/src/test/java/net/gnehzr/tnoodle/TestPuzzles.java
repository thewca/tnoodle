package net.gnehzr.tnoodle;

import net.gnehzr.tnoodle.puzzle.*;
import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.util.LazySupplier;

import java.util.HashMap;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.function.Supplier;

public class TestPuzzles {
    private static final Map<String, Supplier<Puzzle>> TESTABLE_PUZZLES = new HashMap<>();

    static {
        TESTABLE_PUZZLES.put("222", new LazySupplier<>(TwoByTwoCubePuzzle::new));
        TESTABLE_PUZZLES.put("333", new LazySupplier<>(ThreeByThreeCubePuzzle::new));
        TESTABLE_PUZZLES.put("444", new LazySupplier<>(FourByFourCubePuzzle::new));
        TESTABLE_PUZZLES.put("444fast", new LazySupplier<>(FourByFourRandomTurnsCubePuzzle::new));
        TESTABLE_PUZZLES.put("555", new LazySupplier<>(() -> new CubePuzzle(5)));
        TESTABLE_PUZZLES.put("666", new LazySupplier<>(() -> new CubePuzzle(6)));
        TESTABLE_PUZZLES.put("777", new LazySupplier<>(() -> new CubePuzzle(7)));
        TESTABLE_PUZZLES.put("333ni", new LazySupplier<>(NoInspectionThreeByThreeCubePuzzle::new));
        TESTABLE_PUZZLES.put("444ni", new LazySupplier<>(NoInspectionFourByFourCubePuzzle::new));
        TESTABLE_PUZZLES.put("555ni", new LazySupplier<>(NoInspectionFiveByFiveCubePuzzle::new));
        TESTABLE_PUZZLES.put("333fm", new LazySupplier<>(ThreeByThreeCubeFewestMovesPuzzle::new));
        TESTABLE_PUZZLES.put("pyram", new LazySupplier<>(PyraminxPuzzle::new));
        TESTABLE_PUZZLES.put("sq1", new LazySupplier<>(SquareOnePuzzle::new));
        TESTABLE_PUZZLES.put("sq1fast", new LazySupplier<>(SquareOneUnfilteredPuzzle::new));
        TESTABLE_PUZZLES.put("minx", new LazySupplier<>(MegaminxPuzzle::new));
        TESTABLE_PUZZLES.put("clock", new LazySupplier<>(ClockPuzzle::new));
        TESTABLE_PUZZLES.put("skewb", new LazySupplier<>(SkewbPuzzle::new));
    }

    public static SortedMap<String, Supplier<Puzzle>> getTestablePuzzles() {
        return new TreeMap<>(TESTABLE_PUZZLES);
    }
}
