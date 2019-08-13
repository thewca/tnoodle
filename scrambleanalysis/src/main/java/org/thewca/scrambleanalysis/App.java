package org.thewca.scrambleanalysis;

import java.io.IOException;
import java.util.ArrayList;

import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;

public class App {

	public static void main(String[] args)
			throws InvalidScrambleException, RepresentationException, InvalidMoveException, IOException {
		
		// ArrayList<String> scrambles = ScrambleProvider.getScrambles(fileName);
		// Then run boolean passed = testScrambles(scrambles);
		// to test your set of scrambles

		
		
		// Uncomment the following to test randomness of the generated scrambles.

		ArrayList<String> scrambles = ScrambleProvider.generateWcaScrambles(2200);
		boolean passed = CubeTest.testScrambles(scrambles);
		System.out.println("\nMain test passed? " + passed);

	}
}
