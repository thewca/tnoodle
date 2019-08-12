package org.thewca.scrambleanalysis;

import static org.thewca.scrambleanalysis.CubeTest.testScrambles;
import static org.thewca.scrambleanalysis.ScrambleProvider.readStubRandomMovesScrambles;
import static org.thewca.scrambleanalysis.ScrambleProvider.readStubRandomStateScrambles;

import java.io.IOException;
import java.util.ArrayList;

import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;

public class App {

	public static void main(String[] args)
			throws InvalidScrambleException, RepresentationException, InvalidMoveException, IOException {

		ArrayList<String> scramblesRandomState = readStubRandomStateScrambles();
		ArrayList<String> scramblesRandomMoves = readStubRandomMovesScrambles();

		boolean passed = testScrambles(scramblesRandomMoves);
		
		System.out.println("\nPassed? "+passed);
		
	}
}
