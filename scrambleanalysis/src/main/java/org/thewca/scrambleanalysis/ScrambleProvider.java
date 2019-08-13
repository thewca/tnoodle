package org.thewca.scrambleanalysis;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Random;
import java.util.Scanner;

import net.gnehzr.tnoodle.puzzle.ThreeByThreeCubePuzzle;

public class ScrambleProvider {

	public static ArrayList<String> getScrambles(String fileName) throws IOException {

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

	// This is the main test
	public static ArrayList<String> generateWcaScrambles(int N) {

		Random random = new Random();
		ThreeByThreeCubePuzzle cube = new ThreeByThreeCubePuzzle();

		ArrayList<String> scrambles = new ArrayList<String>();

		for (int i = 0; i < N; i++) {

			// Give some status to the user
			if (i%1000 == 0) {
				System.out.println("Generating scramble " + (i + 1) + "/" + N);
			}
			String scramble = cube.generateWcaScramble(random);
			scrambles.add(scramble);
		}
		return scrambles;
	}

}
