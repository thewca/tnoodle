package org.thewca.scrambleanalysis;

import java.util.ArrayList;

public class App {

	public static void main(String[] args)
			throws Exception {
		
		// ArrayList<String> scrambles = ScrambleProvider.getScrambles(fileName);
		// Then run boolean passed = testScrambles(scrambles);
		// to test your set of scrambles

		
		
		// Uncomment the following to test randomness of the generated scrambles.
		int numberOfScrambles = 6500;
		ArrayList<String> scrambles = ScrambleProvider.generateWcaScrambles(numberOfScrambles);
		boolean passed = CubeTest.testScrambles(scrambles);
		System.out.println("\nMain test passed? " + passed);

	}
}
