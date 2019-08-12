package org.thewca.scrambleanalysis;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Random;
import java.util.Scanner;

import net.gnehzr.tnoodle.puzzle.ThreeByThreeCubePuzzle;

public class ScrambleProvider {

	private static ArrayList<String> getScrambles(String fileName) throws IOException {

		ArrayList<String> scrambles = new ArrayList<String>();

		// Read scrambles
		File file = new File(fileName);
		try {
			Scanner input = new Scanner(file);

			while (input.hasNextLine()) {
				String scramble = input.nextLine();
				if (scramble.length() > 0) {
					scrambles.add(scramble);
				}
			}
			input.close();
		} catch (Exception e) {
			throw new IOException("There was an error reading the file.");
		}
		return scrambles;
	}

	public static ArrayList<String> readStubRandomMovesScrambles() throws IOException {
		String fileName = "randomMovesScrambles.txt";
		return getScrambles(fileName);
	}

	public static ArrayList<String> readStubRandomStateScrambles() throws IOException {
		String fileName = "randomStateScrambles.txt";
		return getScrambles(fileName);
	}

	public static ArrayList<String> generateWcaScrambles(int N) {

		Random random = new Random();
		ThreeByThreeCubePuzzle cube = new ThreeByThreeCubePuzzle();

		ArrayList<String> scrambles = new ArrayList<String>();

		for (int i = 0; i < N; i++) {

			// Add quiet?
			System.out.println("Generating scramble " + (i + 1) + "/" + N);
			String scramble = cube.generateWcaScramble(random);
			scrambles.add(scramble);
		}
		return scrambles;
	}

}
