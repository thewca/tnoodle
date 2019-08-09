package org.thewca.scrambleanalysis.statistics;

import org.apache.commons.math3.distribution.BinomialDistribution;

import static org.thewca.scrambleanalysis.statistics.Histogram.*;

import java.util.ArrayList;

public class Distribution {

	private static final int edges = 12;

	/**
	 * Remember that we do not count 1 edge (as it depends on the others).
	 * 
	 * @param N, the number scrambles.
	 * @return An array of Long containing the expected number of misoriented edges
	 *         in N scrambles. Position 0 is for 0 edges; position 1 is for 1 edge,
	 *         etc.
	 */
	public static long[] expectedEdgeOrientationDistribution(long N) {

		// TODO add a limit for N.

		double prob = 0.5;
		long[] array = new long[edges];

		BinomialDistribution bd = new BinomialDistribution(edges, prob);

		for (int i = 0; i < edges; i++) {
			array[i] = (Math.round(N * bd.probability(i)));
		}

		return array;
	}

	public static void expectedEdgeOrientationHistogram(Long N) {
		long[] array = expectedEdgeOrientationDistribution(N);

		String[] subtitle = new String[edges];

		for (int i = 0; i < edges; i++) {
			subtitle[i] = String.format("%02d", i) + " edges";
		}

		histogram(N, array, subtitle);
	}
}
