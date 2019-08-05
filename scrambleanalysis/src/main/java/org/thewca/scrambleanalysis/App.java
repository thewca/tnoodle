package org.thewca.scrambleanalysis;

import net.gnehzr.tnoodle.puzzle.CubePuzzle.CubeState;
import net.gnehzr.tnoodle.puzzle.ThreeByThreeCubePuzzle;

import static org.thewca.scrambleanalysis.CubeHelper.*;
import static org.thewca.scrambleanalysis.statistics.Histogram.histogram;

import java.util.ArrayList;

import org.thewca.scrambleanalysis.statistics.Distribution;

public class App {

	public static void main(String[] args) throws Exception {
		ThreeByThreeCubePuzzle cube = new ThreeByThreeCubePuzzle();

		long N = 10000;
		long parity = 0;

		// The number at position 0 counts the number of scrambles with 0 misoriented
		// edges.
		// The number at position 1 counts the number of scrambles with 1 misoriented
		// edges.
		// etc
		// The odd numbers are possible for edge orientation because we are ignoring 1
		// edge, since it depends on the others.
		// We ignore it for easier analysis using Binomial Distribution.
		ArrayList<Long> misorientedEdgesList = new ArrayList<Long>();
		// Similarly, we only consider 7 corners.
		ArrayList<Long> cornerSumList = new ArrayList<Long>();

		int edges = 12;
		ArrayList<String> subtitleEdges = new ArrayList<String>();
		for (int i = 0; i < edges; i++) {
			misorientedEdgesList.add(0L);
			subtitleEdges.add(String.format("%02d", i) + " edges");
		}

		int corners = 8;
		ArrayList<String> subtitleCorners = new ArrayList<String>();
		for (int i = 0; i < corners * 2; i++) { // Corner sum might be up to 2, so, the *2 here.
			cornerSumList.add(0L);
			subtitleCorners.add(String.format("%02d", i) + " sum");
		}

		for (int i = 0; i < N; i++) {

			String scramble = cube.generateScramble();

			CubeState solved = cube.getSolvedState();
			CubeState cubeState = (CubeState) solved.applyAlgorithm(scramble);
			String representation = cubeState.toFaceCube();

			int misorientedEdges = countMisorientedEdgesIgnoringUB(representation);
			int cornerSum = cornerOrientationSum(representation);

			misorientedEdgesList.set(misorientedEdges, misorientedEdgesList.get(misorientedEdges) + 1);
			cornerSumList.set(cornerSum, cornerSumList.get(cornerSum) + 1);

			if (hasParity(scramble)) {
				parity++;
			}

			assert countMisorientedEdges(representation) == countMisorientedEdgesv2(representation);
		}

		// MVP for histogram.
		System.out.println("Histogram for edges, out of " + N);
		histogram(N, misorientedEdgesList, subtitleEdges);

		System.out.println("\nHistogram for corners, out of " + N);
		histogram(N, cornerSumList, subtitleCorners);

		System.out.println("\nParity cases: " + parity + "/" + N);

		System.out.println("\nExpected distribution for edges.");
		Distribution.expected(N);
	}
}
