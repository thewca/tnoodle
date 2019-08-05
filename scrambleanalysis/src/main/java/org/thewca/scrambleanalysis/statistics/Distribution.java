package org.thewca.scrambleanalysis.statistics;

import org.apache.commons.math3.distribution.BinomialDistribution;

import static org.thewca.scrambleanalysis.statistics.Histogram.*;

import java.util.ArrayList;

public class Distribution {
	public static void expected(long N) {
		
		int trials = 12;
		double prob = 0.5;
		
		ArrayList<Long> array = new ArrayList<Long>();
		ArrayList<String> subtitle = new ArrayList<String>();		
		
		BinomialDistribution bd = new BinomialDistribution(trials, prob);
		
		for (int i=0; i<trials; i++) {
			array.add(Math.round(N*bd.probability(i)));
			subtitle.add(String.format("%02d", i) + " edges");
		}
		
		histogram(trials, array, subtitle);
	}
}
