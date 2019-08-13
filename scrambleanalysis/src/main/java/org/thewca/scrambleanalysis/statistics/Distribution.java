package org.thewca.scrambleanalysis.statistics;

import static org.thewca.scrambleanalysis.utils.Math.nCp;

public class Distribution {

	private static final int edges = 12;
	private static final int corners = 8;

	/**
	 * This is the expected probability distribution for edge orientation
	 * considering random state.
	 * 
	 * @return An array whose size is 7. On the index 0, the chance of 0 pairs
	 *         oriented; on the index 1, the probability for 1 misoriented pair; on
	 *         the index 2, the probability for 2 misoriented pairs;
	 */
	public static double[] expectedEdgesOrientationProbability() {

		long[] array = new long[7];

		long total = 0L;
		for (int i = 0; i < array.length; i++) {

			array[i] = nCp(12L, 2 * i);
			total += nCp(12L, 2 * i);
		}

		double[] expected = new double[array.length];
		for (int i = 0; i < array.length; i++) {
			expected[i] = 1.0 * array[i] / total;
		}
		return expected;
	}

	/**
	 * @param N number of trials
	 * @return An array[12] in which all elements have the same value N/12.
	 */
	public static long[] expectedEdgesFinalPosition(long N) {

		long[] array = new long[edges];

		for (int i = 0; i < edges; i++) {
			array[i] = N / edges;
		}
		return array;
	}

	/**
	 * This is the expected probability distribution for corner orientation
	 * considering random state. We assign 0 for oriented corner, 1 for corners
	 * twisted clockwise, 2 for counter clockwise. In a valid cube, the sum of the
	 * orientation is a multiple of 3.
	 * 
	 * @return An array whose size is 6. On the index 0, the probability of sum 0 in
	 *         corner orientation. On the index 1, the probability of sum 3 = 3 * 1.
	 *         On the index 2, the probability of sum 6 = 3 * 2.
	 */
	public static double[] expectedCornersOrientationProbability() {

		long partial;
		long total = 0L;

		// Corners must sum 0, 3, 6, ..., 15
		long[] array = new long[6];

		for (int i = 0; i < array.length; i++) {
			partial = 0;
			int sum = 3 * i;
			for (int j = 0; j < corners; j++) {
				for (int k = 0; k < corners; k++) {
					if (j * 2 + k * 1 == sum) {
						partial += nCp(8, j) * nCp(8 - j, k);
					}
				}
			}
			total += partial;
			array[i] = partial;
		}

		double[] expected = new double[array.length];
		for (int i = 0; i < array.length; i++) {
			expected[i] = 1.0 * array[i] / total;
		}

		return expected;
	}

	/**
	 * @param N number of trials
	 * @return An array[8] in which all elements have the same value N/8.
	 */
	public static long[] expectedCornersFinalPosition(long N) {

		long[] array = new long[corners];

		for (int i = 0; i < corners; i++) {
			array[i] = N / corners;
		}
		return array;
	}

	/**
	 * 
	 * @return The minimum sample size for our tests.
	 */
	public static long minimumSampleSize() {
		long min = 0;

		// Actually, this is fixed to 2187, but it's nice to have a way to know where
		// does this comes from.

		// Minimum number required so we have at least 1 expected result for edge.
		double[] expectedEdges = expectedEdgesOrientationProbability();
		for (double item : expectedEdges) {
			long number = Math.round(1.0 / item);
			min = Math.max(number, min);
		}

		// Minimum number required so we have at least 1 expected result for corners.
		double[] expectedCorners = expectedCornersOrientationProbability();
		for (double item : expectedCorners) {
			long number = Math.round(1.0 / item);
			min = Math.max(number, min);
		}

		return min;
	}
}
