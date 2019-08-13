package org.thewca.scrambleanalysis.statistics;

import static org.thewca.scrambleanalysis.utils.Math.nCp;

public class Distribution {

	private static final int edges = 12;
	private static final int corners = 8;

	/**
	 * 
	 * @return An array whose size is 7. On the index 0, the chance of 0 pairs
	 *         oriented; on the index 1, the probability for 1 misoriented pair; on
	 *         the index 2, the probability for 2 misoriented pairs;
	 */
	public static double[] expectedEdgesOrientationProbability() {
		expectedCornersOrientationProbability();

		long[] array = new long[7];

		long total = 0L;
		for (long i = 0; i < 7; i++) {

			array[(int) i] = nCp(12L, 2 * i);
			total += nCp(12L, 2 * i);
		}

		double[] expected = new double[array.length];
		for (int i = 0; i < array.length; i++) {
			expected[i] = 1.0 * array[i] / total;
		}
		return expected;
	}

	public static long[] expectedEdgesFinalPosition(long N) {

		long[] array = new long[edges];

		for (int i = 0; i < edges; i++) {
			array[i] = N / edges;
		}
		return array;
	}

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

	public static long[] expectedCornersFinalPosition(long N) {

		long[] array = new long[corners];

		for (int i = 0; i < corners; i++) {
			array[i] = N / corners;
		}
		return array;
	}
}
