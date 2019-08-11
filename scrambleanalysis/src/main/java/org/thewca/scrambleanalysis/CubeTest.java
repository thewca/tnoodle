package org.thewca.scrambleanalysis;

import static org.thewca.scrambleanalysis.CubeHelper.cornerOrientationSum;
import static org.thewca.scrambleanalysis.CubeHelper.countMisorientedEdges;
import static org.thewca.scrambleanalysis.CubeHelper.getFinalPositionOfEdge;
import static org.thewca.scrambleanalysis.CubeHelper.hasParity;
import static org.thewca.scrambleanalysis.statistics.Histogram.histogram;

import java.util.ArrayList;

import org.apache.commons.math3.stat.inference.ChiSquareTest;
import org.thewca.scrambleanalysis.statistics.Distribution;

import net.gnehzr.tnoodle.puzzle.CubePuzzle.CubeState;
import net.gnehzr.tnoodle.puzzle.ThreeByThreeCubePuzzle;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;

public class CubeTest {

	private static final int edges = 12;
	private static final int corners = 8;

	public static boolean testScrambles(ArrayList<String> scrambles)
			throws InvalidScrambleException, RepresentationException, InvalidMoveException {

		// The rarest edge orientation count is 0, which happens in about 1/2^11 =
		// 1/2048 cases.
		// For corners, it's 1/3^7 = 1/2187.
		// Despite close numbers to this would already fit, we ask at least N = 2018 so
		// The Chi Squared Test isn't likely to find double zeroes when comparing
		// columns.

		int N = scrambles.size();

		assert N >= 2187;
		ThreeByThreeCubePuzzle cube = new ThreeByThreeCubePuzzle();

		long parity = 0;

		// The number at position 0 counts the number of scrambles with 0 misoriented
		// edges.
		// The number at position 1 counts the number of scrambles with 2 misoriented
		// edges.
		// etc
		long[] misorientedEdgesList = new long[edges / 2 + 1]; // Pairs of misoriented.

		// New approach for corners.
		// For each corner, we check if its orientation is
		// Oriented -> 0
		// Clock wise -> 1
		// Counter clockwise -> 2
		// Then we check the randomness of corners[i][j].
		long[][] cornersOrientation = new long[corners][3];

		long[][] finalEdgesPosition = new long[edges][edges];
		long[][] finalCornersPosition = new long[corners][corners];

		for (int i = 0; i < N; i++) {

			System.out.println("Scramble: " + (i + 1) + "/" + N);

			String scramble = scrambles.get(i);

			CubeState solved = cube.getSolvedState();
			CubeState cubeState = (CubeState) solved.applyAlgorithm(scramble);
			String representation = cubeState.toFaceCube();

			int misorientedEdges = countMisorientedEdges(representation);
			int cornerSum = cornerOrientationSum(representation);

			misorientedEdgesList[misorientedEdges / 2]++;

			if (hasParity(scramble)) {
				parity++;
			}

			for (int j = 0; j < edges; j++) {
				int finalPosition = getFinalPositionOfEdge(representation, j);
				finalEdgesPosition[j][finalPosition]++;
			}
			/*
			 * for (int j = 0; j < corners; j++) { int finalPosition =
			 * getFinalPositionOfCorner(representation, j);
			 * finalCornersPosition[j][finalPosition]++;
			 * 
			 * int orientationNumber = getCornerOrientationNumber(representation, j);
			 * cornersOrientation[j][orientationNumber]++; }
			 */

		}

		ChiSquareTest cst = new ChiSquareTest();
		double alpha = 0.01;

		long[] expectedEdges = Distribution.expectedEdgesOrientation(N);
		boolean randomEO = !cst.chiSquareTestDataSetsComparison(misorientedEdgesList, expectedEdges, alpha);
		System.out.println("Random EO? " + randomEO);

		boolean edgesRandomPosition = true;
		long[] expectedEdgesFinalPosition = Distribution.expectedEdgesFinalPosition(N);
		for (long[] item : finalEdgesPosition) {
			if (cst.chiSquareTestDataSetsComparison(expectedEdgesFinalPosition, item, alpha)) {
				edgesRandomPosition = false;
			}
		}
		histogram(misorientedEdgesList);
		histogram(expectedEdges);

		System.out.println("Edges in random position? " + edgesRandomPosition);
		return randomEO && edgesRandomPosition;
	}

}
