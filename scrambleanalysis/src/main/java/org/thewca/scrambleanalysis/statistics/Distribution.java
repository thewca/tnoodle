package org.thewca.scrambleanalysis.statistics;

import static org.thewca.scrambleanalysis.statistics.Histogram.histogram;
import static org.thewca.scrambleanalysis.utils.Math.factorial;
import static org.thewca.scrambleanalysis.utils.Math.nCp;

import org.apache.commons.math3.distribution.BinomialDistribution;

public class Distribution {

	private static final int edges = 12;
	private static final int corners = 8;

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

	// Here we generate the expected array distribution for edge sum.
	// Perhaps this could be calculated, but it's kind of tricky, since the last
	// edge orientation depends on the others.
	public static long[] estimatedEdgesOrientation(int N) {

		long[] array = new long[edges / 2 + 1];

		for (int i = 0; i < N; i++) {
			int sum = 0;
			for (int j = 0; j < edges - 1; j++) {
				sum += Math.round(Math.random()); // 0 or 1
			}
			sum += sum % 2; // The last edge makes the sum even.
			array[sum / 2]++;
		}
		return array;
	}

	/**
	 * 
	 * @return An array whose size is 7. On the index 0, the chance of 0 pairs
	 *         oriented; on the index 1, the probability for 1 misoriented pair; on
	 *         the index 2, the probability for 2 misoriented pairs;
	 */
	public static double[] expectedEdgesOrientationProbability() {
		long[] array = new long[7];

		long total = 0L;

		for (long i = 0; i <= 6; i++) {
			long result = 1L;

			// Select where the misoriented edges will be placed
			result *= nCp(12L, 2 * i);

			// Select which edges (colors) will be placed on the selected misoriented spots.
			result *= nCp(12L, 2 * i);

			// Place the selected edges
			result *= factorial(2 * i);

			// Place the remaining
			result *= factorial(12 - 2 * i);

			array[(int) i] = result;

			total += result;
			System.out.println("\nTotal: " + total + "\n");
		}

		double[] expected = new double[7];
		for (int i = 0; i < 7; i++) {
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

	public static long[] expectedCornersOrientationSumDistribution(long N) {

		// TODO add a limit for N. This should be big enough so N*p still fit long.
		// Also, N >= 2048.

		double prob = 1. / 3;
		long[] array = new long[2 * corners - 1]; // From 0 to 11 possible edges, it's still 12 options.

		// Does this make sense?
		// Sum two can be achieved either with +1+1 or +2.
		// TODO investigate if this breaks binomial behavior.

		// Remember: last edge depends on the others.
		BinomialDistribution bd = new BinomialDistribution(2 * corners - 1, prob);

		for (int i = 0; i < 2 * corners - 1; i++) {
			array[i] = Math.round(bd.probability(i) * N);
		}

		return array;
	}

	public static long[] expectedCornersFinalOrientation(long N) {

		long[] array = new long[corners * 3];

		for (int i = 0; i < corners * 3; i++) {
			array[i] = N / 3;
		}
		return array;
	}

	public static long[] expectedCornersFinalPosition(long N) {

		long[] array = new long[corners];

		for (int i = 0; i < corners; i++) {
			array[i] = N / corners;
		}
		return array;
	}
}
