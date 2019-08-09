package org.thewca.scrambleanalysis.statistics;

public class Histogram {
	public static void histogram(long N, long[] array, String[] subtitle) {

		long numberOfChars = 100;
		char theChar = '#';

		long max = array[0];
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

		for (int i = 0; i < array.length; i++) {
			String out = "";
			for (int j = 0; j < 1.0 * array[i] / max * numberOfChars; j++) {
				out += theChar;
			}
			System.out.println((subtitle[i].length() > 0 ? subtitle[i] + " "
					: "") + String.format("%0" + len + "d", array[i]) + ": " + out);
		}
	}

	public static void histogram(long N, long[] array) {
		String[] subtitle = new String[array.length];
		for (int i = 0; i < array.length; i++) {
			subtitle[i] = "";
		}
		histogram(N, array, subtitle);
	}

}
