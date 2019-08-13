package org.thewca.scrambleanalysis;

import static org.thewca.scrambleanalysis.CubeTest.testScrambles;
import static org.thewca.scrambleanalysis.ScrambleProvider.readStubRandomMovesScrambles;
import static org.thewca.scrambleanalysis.ScrambleProvider.readStubRandomStateScrambles;
import static org.thewca.scrambleanalysis.ScrambleProvider.generateWcaScrambles;

import java.io.IOException;
import java.util.ArrayList;

import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;

public class App {

	public static void main(String[] args)
			throws InvalidScrambleException, RepresentationException, InvalidMoveException, IOException {

		ArrayList<String> scramblesRandomMoves = readStubRandomMovesScrambles();
		ArrayList<String> scramblesRandomState = readStubRandomStateScrambles();

		boolean randomMovesPassed = testScrambles(scramblesRandomMoves);
		System.out.println("Random moves passed? " + randomMovesPassed);
		
		System.out.println("");
		
		boolean randomStateWcaPassed = testScrambles(scramblesRandomState);
		System.out.println("Random state passed? " + randomStateWcaPassed);
		
		ArrayList<String> scrambles = generateWcaScrambles(2048);
		boolean passed = testScrambles(scrambles);
		System.out.println("\nMain test passed? " + passed);

	}
}
