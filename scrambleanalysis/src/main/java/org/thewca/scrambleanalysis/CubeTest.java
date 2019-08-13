package org.thewca.scrambleanalysis;

import static org.thewca.scrambleanalysis.CubeHelper.cornerOrientationSum;
import static org.thewca.scrambleanalysis.CubeHelper.countMisorientedEdges;
import static org.thewca.scrambleanalysis.CubeHelper.getFinalPositionOfCorner;
import static org.thewca.scrambleanalysis.CubeHelper.getFinalPositionOfEdge;
import static org.thewca.scrambleanalysis.CubeHelper.hasParity;
import static org.thewca.scrambleanalysis.statistics.Distribution.expectedCornersFinalPosition;
import static org.thewca.scrambleanalysis.statistics.Distribution.expectedCornersOrientationProbability;
import static org.thewca.scrambleanalysis.statistics.Distribution.expectedEdgesFinalPosition;
import static org.thewca.scrambleanalysis.statistics.Distribution.expectedEdgesOrientationProbability;

import java.util.ArrayList;

import org.apache.commons.math3.stat.inference.AlternativeHypothesis;
import org.apache.commons.math3.stat.inference.BinomialTest;
import org.apache.commons.math3.stat.inference.ChiSquareTest;

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

		long[] misorientedEdgesList = new long[7];
		long[][] finalEdgesPosition = new long[edges][edges];

		long[] misorientedCornersList = new long[6]; // Sum is 0, 3, 6, ..., 15.
		long[][] finalCornersPosition = new long[corners][corners];

		int parity = 0;

		for (int i = 0; i < N; i++) {

			String scramble = scrambles.get(i);

			CubeState solved = cube.getSolvedState();
			CubeState cubeState = (CubeState) solved.applyAlgorithm(scramble);
			String representation = cubeState.toFaceCube();

			int misorientedEdges = countMisorientedEdges(representation);
			int cornerSum = cornerOrientationSum(representation);

			misorientedEdgesList[misorientedEdges / 2]++;
			misorientedCornersList[cornerSum / 3]++;

			for (int j = 0; j < edges; j++) {
				int finalPosition = getFinalPositionOfEdge(representation, j);
				finalEdgesPosition[j][finalPosition]++;
			}

			for (int j = 0; j < corners; j++) {
				int finalPosition = getFinalPositionOfCorner(representation, j);
				finalCornersPosition[j][finalPosition]++;
			}

			if (hasParity(scramble)) {
				parity++;
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

		double[] expectedCorners = expectedCornersOrientationProbability();
		boolean randomCO = !cst.chiSquareTest(expectedCorners, misorientedCornersList, alpha);
		System.out.println("Random CO? " + randomCO);

		boolean cornersRandomPosition = true;
		long[] expectedCornersFinalPosition = expectedCornersFinalPosition(N);
		for (long[] item : finalCornersPosition) {
			if (cst.chiSquareTestDataSetsComparison(expectedCornersFinalPosition, item, alpha)) {
				cornersRandomPosition = false;
				break;
			}
		}
		System.out.println("Corners in random position? " + cornersRandomPosition);

		BinomialTest bt = new BinomialTest();
		double probability = 0.5;
		boolean randomParity = !bt.binomialTest(N, parity, probability, AlternativeHypothesis.TWO_SIDED, alpha);
		System.out.println("Random parity? " + randomParity);

		return randomEO && edgesRandomPosition && randomCO && cornersRandomPosition && randomParity;
	}

}
