package org.thewca.scrambleanalysis;

import net.gnehzr.tnoodle.puzzle.ThreeByThreeCubePuzzle;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;
import net.gnehzr.tnoodle.scrambles.Puzzle.PuzzleState;

/**
 * Hello world!
 *
 */
public class App {
	public static void main(String[] args) throws InvalidScrambleException {
		String scramble = "R' U' F U2 L2 D L2 D' R2 U B2 F' U F' R U2 L' F R' B R U R' U' F";
		ThreeByThreeCubePuzzle cube = new ThreeByThreeCubePuzzle();
		
		PuzzleState state = cube.getSolvedState().applyAlgorithm(scramble);
		System.out.println(state);
	}
}
