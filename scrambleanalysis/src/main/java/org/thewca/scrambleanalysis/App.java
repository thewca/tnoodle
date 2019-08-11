package org.thewca.scrambleanalysis;

import java.io.File;
import java.util.ArrayList;
import java.util.Random;
import java.util.Scanner;

import net.gnehzr.tnoodle.puzzle.ThreeByThreeCubePuzzle;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;
import net.gnehzr.tnoodle.scrambles.InvalidScrambleException;

import static org.thewca.scrambleanalysis.CubeTest.testScrambles;

public class App {

	public static void main(String[] args)
			throws InvalidScrambleException, RepresentationException, InvalidMoveException {

		int N = 500;

		ThreeByThreeCubePuzzle cube = new ThreeByThreeCubePuzzle();

		ArrayList<String> scrambles = new ArrayList<String>();

//		String fileName = "randomMovesScrambles.txt";
		String fileName = "randomStateScrambles.txt";
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

		}

/*		Random random = new Random();
		for (int i = 0; i < N; i++) {
			System.out.println("Generating scramble " + (i + 1) + "/" + N);
			String scramble = cube.generateWcaScramble(random);
			System.out.println(scramble);
			scrambles.add(scramble);
		}*/

		testScrambles(scrambles);
//		for (String scramble : scrambles) {
//			System.out.println(scramble);
//		}
	}
}
