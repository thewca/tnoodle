package org.thewca.scrambleanalysis;

import net.gnehzr.tnoodle.puzzle.CubePuzzle.CubeState;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;

public class CubeHelper {
	// For 3x3 only.

	private static char[] ALLOWED = {'U', 'R', 'F', 'D', 'L', 'B'};

	// For DB edge orientation, we only care about U/D, Equator F/B.
	private static int[] edgesIndex = { 1, 3, 5, 7, // U edges index
			28, 30, 32, 34, // D edges index
			21, 23, // Equator front
			48, 50 // Equator back
	};

	// Each edge has 2 stickers. This array represents, respectively, the index of
	// the other attached sticker.
	private static int[] attachedEdgesIndex = { 46, 37, 10, 19, // Attached to the U face.
			25, 43, 16, 52, // Attached to the D face
			41, 12, // Attached to Equator front
			14, 39 // Attached to Equator back
	};

	private static int[] cornersIndex = { 0, 2, 6, 8, // U corners
			27, 29, 33, 35 }; // D corners
	private static int[] cornersIndexClockWise = { 36, 45, 18, 9, // U twist clockwise
			44, 26, 53, 17, // D stickers
	};
	private static int[] cornersIndexCounterClockWise = { 47, 11, 38, 20, // U twists
			24, 15, 42, 51 }; // D twists

	/**
	 * Count misoriented edges considering the FB axis.
	 * 
	 * @param cubeState
	 * @return
	 * @throws RepresentationException
	 */
	public static int countMisorientedEdges(String representation) throws RepresentationException {
		assert representation.length() == 54 : "Expected size: 54 = 6x9 stickers. Use cubeState.toFaceCube().";

		int central = 4; // Index 4 represents the central sticker;
		int stickersPerFace = 9;

		char uColor = representation.charAt(central + 0 * stickersPerFace);
		char rColor = representation.charAt(central + 1 * stickersPerFace);
		char fColor = representation.charAt(central + 2 * stickersPerFace);
		char dColor = representation.charAt(central + 3 * stickersPerFace);
		char lColor = representation.charAt(central + 4 * stickersPerFace);
		char bColor = representation.charAt(central + 5 * stickersPerFace);

		int result = 0;
		for (int i = 0; i < edgesIndex.length; i++) {

			int index = edgesIndex[i];
			char color = representation.charAt(index);

			int attachedIndex = attachedEdgesIndex[i];
			int attachedColor = representation.charAt(attachedIndex);

			if (color == uColor || color == dColor) {
				// Yay, oriented edge.
			} else if (color == rColor || color == lColor) {
				result++;
			} else if (color == fColor || color == bColor) {
				if (attachedColor == uColor || attachedColor == dColor) {
					result++;
				}
			} else {
				throw new RepresentationException();
			}
		}
		return result;
	}

	public static int countMisorientedEdges(CubeState cubeState) throws RepresentationException {
		String representation = cubeState.toFaceCube();
		return countMisorientedEdges(representation);
	}

	/**
	 * Sum of corner orientation. 0 for oriented, 1 for clockwise, 2 for counter
	 * clock wise.
	 * 
	 * @param representation
	 * @return The sum of it.
	 * @throws RepresentationException
	 */
	public static int cornerOrientationSum(String representation) throws RepresentationException {
		assert representation.length() == 54 : "Expected size: 54 = 6x9 stickers. Use cubeState.toFaceCube().";

		int central = 4; // Index 4 represents the central sticker;
		int stickersPerFace = 9;

		char uColor = representation.charAt(central + 0 * stickersPerFace);
		char dColor = representation.charAt(central + 3 * stickersPerFace);

		int result = 0;

		int corners = 8;
		for (int i = 0; i < corners; i++) {
			int index = cornersIndex[i];
			int indexClockWise = cornersIndexClockWise[i];
			int indexCounterClockWise = cornersIndexCounterClockWise[i];

			char sticker = representation.charAt(index);
			char stickerClockWise = representation.charAt(indexClockWise);
			char stickerCounterClockWise = representation.charAt(indexCounterClockWise);

			if (sticker == uColor || sticker == dColor) {
				// Corner oriented
			} else if (stickerClockWise == uColor || stickerClockWise == dColor) {
				result++;
			} else if (stickerCounterClockWise == uColor || stickerCounterClockWise == dColor) {
				result += 2;
			} else {
				throw new RepresentationException();
			}
		}

		return result;
	}
	
	private static boolean isAllowedFace(char move) {
		for (char item : ALLOWED) {
			if (item == move) {
				return true;
			}
		}
		return false;
	}

	// U changes the parity, U2 keeps it. Thus, the parity is the oddness of the sum of moves in QTM.
	public static boolean hasParity(String scramble) throws InvalidMoveException {
		int sum = 0;
		
		for (String move : scramble.split(" ")) {
			char face = move.charAt(0);
			int size = move.length();
			
			if (!isAllowedFace(face) || size > 2) {
				throw new InvalidMoveException(move);
			}
			
			if (size == 2) {
				char direction = move.charAt(1);
				if (direction == '\'') {
					sum++;
				} else if (direction != '2') {
					// We allow the '2' direction, but nothing has to be done. 
					throw new InvalidMoveException(move);
				}
			}
		}

		return sum % 2 == 1;
	}
}
