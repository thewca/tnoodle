package org.thewca.scrambleanalysis;

import static org.junit.Assert.assertFalse;

import java.util.ArrayList;
import java.util.Random;

import org.junit.Test;

public class CubeTestTest {

	private Random random = new Random();

	// This checks if the main test fail for random moves, but there's a chance random moves passes.
	// It would be awkward if someone in the future sends a change and this not related test fails travis.
	//@Test
	public void test() throws Exception {
		// Test should fail for random moves, but there's a chance this gives a false
		// positive.
		int N = 6600;
		ArrayList<String> scrambles = randomMovesScrambles(N);
		assertFalse(CubeTest.testScrambles(scrambles));
	}

	private ArrayList<String> randomMovesScrambles(int N) {
		int randomMoves = 25; // Random moves.
		ArrayList<String> result = new ArrayList<String>();
		for (int i = 0; i < N; i++) {
			result.add(randomMovesScramble(randomMoves));
		}
		return result;
	}

	private String randomMovesScramble(int N) {
		if (N == 1) {
			return randomMove();
		}
		String move1 = randomMove();
		String move2;

		while (true) {
			move2 = randomMove();

			if (!sameFace(move1, move2)) {
				break;
			}
		}

		String[] scrambleArray = new String[N];
		scrambleArray[0] = move1;
		scrambleArray[1] = move2;

		if (N == 2) {
			return move1 + " " + move2;
		}

		int j = 2;
		while (j < N) {
			String move = randomMove();

			if (sameFace(move, scrambleArray[j - 1])) {
				continue;
			}

			if (isParallel(move, scrambleArray[j - 1]) && isParallel(move, scrambleArray[j - 2])) {
				continue;
			}

			scrambleArray[j] = move;
			j++;
		}

		String scramble = "";
		for (String move : scrambleArray) {
			scramble += " " + move;
		}
		return scramble.trim();
	}

	private boolean sameFace(String move1, String move2) {
		return move1.charAt(0) == move2.charAt(0);
	}

	private String randomMove() {
		char face = randomFace();
		char direction = randomDirection();
		return ("" + face + direction).trim();
	}

	private char randomFace() {
		String allowed = "UFRDLB";
		int index = random.nextInt(allowed.length());
		return allowed.charAt(index);
	}

	private char randomDirection() {
		String direction = " '2";
		int index = random.nextInt(direction.length());
		return direction.charAt(index);
	}

	// Avoid L R L'
	private boolean isParallel(String move1, String move2) {
		String fb = "FB";
		String lr = "LR";
		String ud = "UD";

		char face1 = move1.charAt(0);
		char face2 = move2.charAt(0);

		if (fb.indexOf(face1) >= 0) {
			return fb.indexOf(face2) >= 0;
		}
		if (lr.indexOf(face1) >= 0) {
			return lr.indexOf(face2) >= 0;
		}
		if (ud.indexOf(face1) >= 0) {
			return ud.indexOf(face2) >= 0;
		}

		return false;
	}
}
