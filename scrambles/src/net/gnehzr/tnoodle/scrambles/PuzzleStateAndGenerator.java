package net.gnehzr.tnoodle.scrambles;

import net.gnehzr.tnoodle.scrambles.Puzzle.PuzzleState;

public class PuzzleStateAndGenerator {
    PuzzleState state;
    String generator;
    public PuzzleStateAndGenerator(PuzzleState state, String generator) {
        this.state = state;
        this.generator = generator;
    }
}
