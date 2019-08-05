package org.thewca.scrambleanalysis.statistics;

import java.util.ArrayList;

public class Histogram {
	public static void histogram(long N, ArrayList<Long> array, ArrayList<String> subtitle) {

		long numberOfChars = 100;
		char theChar = '#';

		long max = array.get(0);
		for (long item : array) {
			System.out.print(item + " ");
			if (item > max) {
				max = item;
			}
		}
		System.out.println("");
		if (max == 0) {
			return;
		}

		int len = ("" + max).length();

		for (int i = 0; i < array.size(); i++) {
			String out = "";
			for (int j = 0; j < 1.0 * array.get(i) / max * numberOfChars; j++) {
				out += theChar;
			}
			System.out.println((subtitle.get(i).length() > 0 ? subtitle.get(i) + " "
					: "") + String.format("%0" + len + "d", array.get(i)) + ": " + out);
		}
	}

	public static void histogram(long N, ArrayList<Long> array) {
		ArrayList<String> subtitle = new ArrayList<String>();
		for (int i = 0; i < array.size(); i++) {
			subtitle.add("");
		}
		histogram(N, array, subtitle);

	}

}
