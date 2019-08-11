package org.thewca.scrambleanalysis;

import net.gnehzr.tnoodle.puzzle.CubePuzzle.CubeState;
import net.gnehzr.tnoodle.puzzle.ThreeByThreeCubePuzzle;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;

import static org.thewca.scrambleanalysis.CubeHelper.*;
import static org.thewca.scrambleanalysis.statistics.Histogram.histogram;

import java.util.Random;

import org.apache.commons.math3.stat.inference.ChiSquareTest;
import org.thewca.scrambleanalysis.statistics.Distribution;

public class App {

	public static void main(String[] args)
			throws InvalidScrambleException, RepresentationException, InvalidMoveException {

		ThreeByThreeCubePuzzle cube = new ThreeByThreeCubePuzzle();

		// The rarest case here is 0 oriented edges, which happens on about 1/2^11, so
		// we need at least N = 2^11
		long N = 100;
		long parity = 0;

		int edges = 12;
		int corners = 8;

		// The number at position 0 counts the number of scrambles with 0 misoriented
		// edges.
		// The number at position 1 counts the number of scrambles with 1 misoriented
		// edges.
		// etc
		// The odd numbers are possible for edge orientation because we are ignoring 1
		// edge, since it depends on the others.
		// We ignore it for easier analysis using Binomial Distribution.
		long[] misorientedEdgesList = new long[edges];

		// Similarly, we only consider 7 corners.
		// Max sum is 7*2 = 14, so we need a 15 sized array.
//		long[] cornerSumList = new long[2 * corners - 1];

		// New approach for corners.
		// For each corner, we check if its orientation is
		// Oriented -> 0
		// Clock wise -> 1
		// Counter clockwise -> 2
		// Then we check the randomness of corners[i][j].
		long[][] cornersOrientation = new long[corners][3];

		// Count how many times edge/corner index j ended on index k.
		long[][] finalEdgesPosition = new long[edges][edges];
		long[][] finalCornersPosition = new long[corners][corners];

		for (int i = 0; i < N; i++) {
			System.out.println("Scramble: " + i);

			String scramble = cube.generateWcaScramble(new Random());

			CubeState solved = cube.getSolvedState();
			CubeState cubeState = (CubeState) solved.applyAlgorithm(scramble);
			String representation = cubeState.toFaceCube();

			int misorientedEdges = countMisorientedEdgesIgnoringUB(representation);
			int cornerSum = cornerOrientationSum(representation);

			misorientedEdgesList[misorientedEdges]++;
//			cornerSumList[cornerSum]++;

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

				int orientationNumber = getCornerOrientationNumber(representation, j);
				cornersOrientation[j][orientationNumber]++;
			}
		}

		ChiSquareTest cst = new ChiSquareTest();
		double alpha = 0.01;

//		long[] expectedEdges = Distribution.expectedEdgesOrientationDistribution(N);
//		boolean randomEOCanBeRejected = cst.chiSquareTestDataSetsComparison(misorientedEdgesList, expectedEdges, alpha);
//		System.out.println("Random EO? " + !randomEOCanBeRejected);

		/*
		 * boolean edgesRandomPosition = true; long[] expectedEdgesFinalPosition =
		 * Distribution.expectedEdgesFinalPosition(N); for (long[] item :
		 * finalPositions) { if
		 * (cst.chiSquareTestDataSetsComparison(expectedEdgesFinalPosition, item,
		 * alpha)) { edgesRandomPosition = false; } }
		 * System.out.println("Edges in random position? " + edgesRandomPosition);
		 */

		boolean cornersRandomPosition = true;
		long[] expectedCornersFinalPosition = Distribution.expectedCornersFinalPosition(N);
		for (long[] item : finalCornersPosition) {
			if (cst.chiSquareTestDataSetsComparison(expectedCornersFinalPosition, item, alpha)) {
				cornersRandomPosition = false;
			}
		}
		System.out.println("Corners in random position? " + cornersRandomPosition);
		
		long[] gatheredCorners = new long[corners * 3];
		for (int i=0; i<corners; i++) {
			for (int j=0; j<3; j++) {
				gatheredCorners[3*i + j] = cornersOrientation[i][j];
			}
		}
		histogram(gatheredCorners);
		
		boolean randomCOCanBeRejected = cst.chiSquareTestDataSetsComparison(Distribution.expectedCornersFinalOrientation(N), gatheredCorners, alpha);
		System.out.println("Random CO? " + !randomCOCanBeRejected);
	}

}
