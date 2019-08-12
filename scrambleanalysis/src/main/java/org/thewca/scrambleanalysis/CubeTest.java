package org.thewca.scrambleanalysis;

import static org.thewca.scrambleanalysis.CubeHelper.cornerOrientationSum;
import static org.thewca.scrambleanalysis.CubeHelper.countMisorientedEdges;
import static org.thewca.scrambleanalysis.CubeHelper.getFinalPositionOfCorner;
import static org.thewca.scrambleanalysis.CubeHelper.getFinalPositionOfEdge;
import static org.thewca.scrambleanalysis.CubeHelper.hasParity;

import java.util.ArrayList;

import org.apache.commons.math3.stat.inference.ChiSquareTest;
import static org.thewca.scrambleanalysis.statistics.Distribution.expectedEdgesOrientationProbability;
import static org.thewca.scrambleanalysis.statistics.Distribution.expectedEdgesFinalPosition;
import static org.thewca.scrambleanalysis.statistics.Distribution.expectedCornersFinalPosition;

import net.gnehzr.tnoodle.puzzle.CubePuzzle.CubeState;
import net.gnehzr.tnoodle.puzzle.ThreeByThreeCubePuzzle;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;

public class CubeTest {

	private static final int edges = 12;
	private static final int corners = 8;

	public static boolean testScrambles(ArrayList<String> scrambles)
			throws InvalidScrambleException, RepresentationException, InvalidMoveException {

		int N = scrambles.size();

		ThreeByThreeCubePuzzle cube = new ThreeByThreeCubePuzzle();

		long parity = 0;

		// New approach for corners.
		// For each corner, we check if its orientation is
		// Oriented -> 0
		// Clock wise -> 1
		// Counter clockwise -> 2
		// Then we check the randomness of corners[i][j].
//		long[][] cornersOrientation = new long[corners][3];

		long[][] finalEdgesPosition = new long[edges][edges];
		long[][] finalCornersPosition = new long[corners][corners];

		long[] misorientedEdgesList = new long[edges / 2 + 1];

		for (int i = 0; i < N; i++) {

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

			for (int j = 0; j < corners; j++) {
				int finalPosition = getFinalPositionOfCorner(representation, j);
				finalCornersPosition[j][finalPosition]++;

//			 int orientationNumber = getCornerOrientationNumber(representation, j);
//			 cornersOrientation[j][orientationNumber]++;
			}

		}

		ChiSquareTest cst = new ChiSquareTest();
		double alpha = 0.01;

		double[] expectedEdges = expectedEdgesOrientationProbability();
		boolean randomEO = !cst.chiSquareTest(expectedEdges, misorientedEdgesList, alpha);
		System.out.println("Random EO? " + randomEO);

		boolean edgesRandomPosition = true;
		long[] expectedEdgesFinalPosition = expectedEdgesFinalPosition(N);
		for (long[] item : finalEdgesPosition) {
			if (cst.chiSquareTestDataSetsComparison(expectedEdgesFinalPosition, item, alpha)) {
				edgesRandomPosition = false;
				break;
			}
		}
		System.out.println("Edges in random position? " + edgesRandomPosition);
		
		boolean cornersRandomPosition = true;
		long[] expectedCornersFinalPosition = expectedCornersFinalPosition(N);
		for (long[] item : finalCornersPosition) {
			if (cst.chiSquareTestDataSetsComparison(expectedCornersFinalPosition, item, alpha)) {
				cornersRandomPosition = false;
				break;
			}
		}
		System.out.println("\nCorners in random position? " + cornersRandomPosition);
		
		return randomEO && edgesRandomPosition && cornersRandomPosition;
	}

}
