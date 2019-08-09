package org.thewca.scrambleanalysis;

import net.gnehzr.tnoodle.puzzle.CubePuzzle.CubeState;
import net.gnehzr.tnoodle.puzzle.ThreeByThreeCubePuzzle;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;

import static org.thewca.scrambleanalysis.CubeHelper.*;
import static org.thewca.scrambleanalysis.statistics.Histogram.histogram;

import java.util.ArrayList;

import org.apache.commons.math3.distribution.BinomialDistribution;
import org.apache.commons.math3.stat.inference.ChiSquareTest;
import org.thewca.scrambleanalysis.statistics.Distribution;

public class App {

	public static void main(String[] args) throws InvalidScrambleException, RepresentationException, InvalidMoveException {
		ThreeByThreeCubePuzzle cube = new ThreeByThreeCubePuzzle();

		long N = 10000;
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
		long[] cornerSumList = new long[2 * corners];

		String[] subtitleEdges = new String[edges];
		for (int i = 0; i < edges; i++) {
			misorientedEdgesList[i] = 0; // Just in case.
			subtitleEdges[i] = String.format("%02d", i) + " edges";
		}

		String[] subtitleCorners = new String[2 * corners];
		for (int i = 0; i < 2 * corners; i++) { // Corner sum might be up to 2, so, the *2 here.
			cornerSumList[i] = 0; // Just in case.
			subtitleCorners[i] = String.format("%02d", i) + " sum";
		}

		for (int i = 0; i < N; i++) {

			String scramble = cube.generateScramble();

			CubeState solved = cube.getSolvedState();
			CubeState cubeState = (CubeState) solved.applyAlgorithm(scramble);
			String representation = cubeState.toFaceCube();

			int misorientedEdges = countMisorientedEdgesIgnoringUB(representation);
			int cornerSum = cornerOrientationSum(representation);

			misorientedEdgesList[misorientedEdges]++;
			cornerSumList[cornerSum]++;

			if (hasParity(scramble)) {
				parity++;
			}
		}

		long[] expectedEdges = Distribution.expectedEdgeOrientationDistribution(N);
		
		for (int i=0; i<edges; i++) {
			if (expectedEdges[i] == 0 && misorientedEdgesList[i] == 0) {
				expectedEdges[i] = 1;
				misorientedEdgesList[i] = 1;
			}
		}

		// MVP for histogram.
		System.out.println("Histogram for edges, out of " + N);
		histogram(N, misorientedEdgesList, subtitleEdges);

		System.out.println("\nHistogram for corners, out of " + N);
		histogram(N, cornerSumList, subtitleCorners);

		System.out.println("\nParity cases: " + parity + "/" + N);

		System.out.println("\nExpected distribution for edges.");
		histogram(N, expectedEdges);
		
		ChiSquareTest cst = new ChiSquareTest();
		double alpha = 0.01;
		System.out.println(cst.chiSquareDataSetsComparison(misorientedEdgesList, expectedEdges));
		boolean flag = cst.chiSquareTestDataSetsComparison(misorientedEdgesList, expectedEdges, alpha);
		System.out.println("Passed? " + flag);
		
	}
}
