package org.thewca.scrambleanalysis.statistics;

import org.apache.commons.math3.distribution.BinomialDistribution;

import static org.thewca.scrambleanalysis.statistics.Histogram.*;

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
	public static long[] expectedEdgesOrientationDistribution(long N) {

		// TODO add a limit for N. This should be big enough so N*p still fit long.
		// Also, N >= 2048.

		double prob = 0.5;
		long[] array = new long[edges]; // From 0 to 11 possible edges, it's still 12 options.

		// Remember: last edge depends on the others.
		BinomialDistribution bd = new BinomialDistribution(edges - 1, prob);

		for (int i = 0; i < edges; i++) {
			array[i] = Math.round(bd.probability(i) * N);
		}

		return array;
	}

	public static void expectedEdgesOrientationHistogram(long N) {
		long[] array = expectedEdgesOrientationDistribution(N);

		String[] subtitle = new String[edges];

		for (int i = 0; i < edges; i++) {
			subtitle[i] = String.format("%02d", i) + " edges";
		}

		histogram(array, subtitle);
	}
	
	public static long[] expectedEdgesFinalPosition(long N) {

		long[] array = new long[edges];

		for (int i = 0; i < edges; i++) {
			array[i] = N / edges;
		}

		return array;
	}
}
