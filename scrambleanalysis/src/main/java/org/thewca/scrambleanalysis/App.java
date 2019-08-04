package org.thewca.scrambleanalysis;

import net.gnehzr.tnoodle.puzzle.CubePuzzle.CubeState;
import net.gnehzr.tnoodle.puzzle.ThreeByThreeCubePuzzle;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;

import static org.thewca.scrambleanalysis.CubeHelper.*;

public class App {

	public static void main(String[] args)
			throws RepresentationException, InvalidScrambleException, InvalidMoveException {
		ThreeByThreeCubePuzzle cube = new ThreeByThreeCubePuzzle();

		int N = 1000;
		int parity = 0;

		int[] edgeOrientation = { 0, 0, 0, 0, 0, 0, 0 }; // 0, 2, 4, ..., 12 edges misoriented
		int[] cornerOrientation = { 0, 0, 0, 0, 0, 0 }; // 0, 3, 6, ..., 15

		for (int i = 0; i < N; i++) {

			String scramble = cube.generateScramble();

			CubeState solved = cube.getSolvedState();
			CubeState cubeState = (CubeState) solved.applyAlgorithm(scramble);
			String representation = cubeState.toFaceCube();

			int misorientedEdges = countMisorientedEdges(representation);
			int cornerSum = cornerOrientationSum(representation);

			edgeOrientation[misorientedEdges / 2]++;
			cornerOrientation[cornerSum / 3]++;

			if (hasParity(scramble)) {
				parity++;
			}
		}

		// MVP for histogram.
		System.out.println("Histogram for edges, out of " + N);
		histogram(N, edgeOrientation);

		System.out.println("\nHistogram for corners, out of " + N);
		histogram(N, cornerOrientation);

		System.out.println("\nParity cases: " + parity + "/" + N);
	}

	public static void histogram(int N, int[] array) {
		int numberOfChars = 20;
		char theChar = '#';

		int max = array[0];
		for (int item : array) {
			System.out.print(item + " ");
			if (item > max) {
				max = item;
			}
		}
		if (max == 0) {
			return;
		}
		System.out.println("");

		for (int item : array) {
			String out = "";
			for (int i = 0; i < 1.0 * item / max * numberOfChars; i++) {
				out += theChar;
			}
			System.out.println(out);
		}
	}
}
