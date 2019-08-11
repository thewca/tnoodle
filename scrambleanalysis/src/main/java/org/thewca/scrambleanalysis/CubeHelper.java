package org.thewca.scrambleanalysis;

import java.util.Arrays;

import net.gnehzr.tnoodle.puzzle.CubePuzzle.CubeState;
import net.gnehzr.tnoodle.scrambles.InvalidMoveException;

import static org.thewca.scrambleanalysis.utils.Utils.stringCompareIgnoringOrder;

public class CubeHelper {
	// For 3x3 only.

	private static char[] ALLOWED = { 'U', 'R', 'F', 'D', 'L', 'B' };

	private static final int edges = 12;
	private static final int central = 4; // Index 4 represents the central sticker;
	private static final int stickersPerFace = 9;

	private static final int corners = 8;;
	
	// Refer to toFaceCube representation.
	// For FB edge orientation, we only care about edges on U/D, Equator F/B.
	// Also, this sets an order to edges, which will be reused
	// UB, UL, UR, UF
	// DF, DL, DR, DB
	// FL, FR
	// BR, BL
	private static final int[] edgesIndex = { 1, 3, 5, 7, // U edges index
			28, 30, 32, 34, // D edges index
			21, 23, // Equator front
			48, 50 // Equator back
	};

	// Each edge has 2 stickers. This array represents, respectively, the index of
	// the other attached sticker.
	private static final int[] attachedEdgesIndex = { 46, 37, 10, 19, // Attached to the U face.
			25, 43, 16, 52, // Attached to the D face
			41, 12, // Attached to Equator front
			14, 39 // Attached to Equator back
	};

	// Again, an order to corners
	// UBL, UBR, UFL, UFR,
	// DFL, DFR, DBL, DBR
	private static final int[] cornersIndex = { 0, 2, 6, 8, // U corners
			27, 29, 33, 35 }; // D corners
	private static final int[] cornersIndexClockWise = { 36, 45, 18, 9, // U twist clockwise
			44, 26, 53, 17, // D stickers
	};
	private static final int[] cornersIndexCounterClockWise = { 47, 11, 38, 20, // U twists
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

		int result = 0;
		for (int i = 0; i < edgesIndex.length; i++) {

			int index = edgesIndex[i];
			if (!isOrientedEdge(representation, index)) {
				result++;
			}
		}
		return result;
	}

	public static int countMisorientedEdges(CubeState cubeState) throws RepresentationException {
		String representation = cubeState.toFaceCube();
		return countMisorientedEdges(representation);
	}

	// For calculations, we do not look at the 12 edges. Since the last one depends
	// on the others,
	// it is excluded from the probability. The method helps on this.
	private static boolean isOrientedEdge(String representation, int sticker) throws RepresentationException {
		char color;
		char attachedColor;

		char uColor = representation.charAt(central + 0 * stickersPerFace);
		char rColor = representation.charAt(central + 1 * stickersPerFace);
		char fColor = representation.charAt(central + 2 * stickersPerFace);
		char dColor = representation.charAt(central + 3 * stickersPerFace);
		char lColor = representation.charAt(central + 4 * stickersPerFace);
		char bColor = representation.charAt(central + 5 * stickersPerFace);

		for (int i = 0; i < edgesIndex.length; i++) {
			if (edgesIndex[i] == sticker) {
				color = representation.charAt(edgesIndex[i]);
				attachedColor = representation.charAt(attachedEdgesIndex[i]);

				if (color == uColor || color == dColor) {
					return true;
				}
				if (color == rColor || color == lColor) {
					return false;
				}
				// Now, we're left with f and b colors.
				if (attachedColor == uColor || attachedColor == dColor) {
					return false;
				} else if (attachedColor == rColor || attachedColor == lColor) {
					return true;
				}
			}
		}

		throw new RepresentationException();
	}

	public static int countMisorientedEdgesIgnoringUB(String representation) throws RepresentationException {
		int result = countMisorientedEdges(representation);
		int sticker = 1; // U of the UB edge. Actually, any edge would do it.
		if (!isOrientedEdge(representation, sticker)) {
			result--;
		}
		return result;
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

	// U changes the parity, U2 keeps it. Thus, the parity is the oddness of the sum
	// of moves in QTM.
	public static boolean hasParity(String scramble) throws InvalidMoveException {
		int sum = 0;

		for (String move : scramble.split(" ")) {
			char face = move.charAt(0);
			int size = move.length();

			if (!isAllowedFace(face) || size > 2) {
				throw new InvalidMoveException(move);
			}

			if (size == 1) {
				sum++;
			} else { // This is the same as else if (size == 2)
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

	// Actually, these next 2 methods did not need to be public, but it's for
	// consistency with the
	// getFinalLocationOfEdheSticker method.
	public int[] getEdgesIndex() {
		return edgesIndex;
	}

	public int[] getAttachedEdgesIndex() {
		return attachedEdgesIndex;
	}

	/**
	 * Given a representation of a cube and the initial position of an edge (when
	 * solved), returns the final index position of that edge. The UB sticker is the
	 * first one on a toFaceCube representation, so call this 0 (index). Consider a
	 * U applied to a solved cube and let's call this repr. UB goes to UR, which is
	 * the 3rd edge in a representation (solved).
	 * getFinalLocationOfEdgeSticker(repr, 0) returns 2, which is 3rd sticker (0
	 * based).
	 * 
	 * UF is initially the 4th edge, so index 3. When an F is applied it goes to RF,
	 * which is the 6th edge on the toFaceCube representation, so this returns 5.
	 * 
	 * @param representation: the final representation of a cube.
	 * @param i:              the index, when solved, of a edge (0 for UB or BU, 1
	 *                        for UL or LU, 3 for UR...
	 * @return: If the final position of a sticker is in UB (either U or B), it
	 *          returns 0 (which is the index of UB in edgesIndex or
	 *          attachedEdgesIndex). If the final position of a sticker is in UL
	 *          (either U or L), it returns 1 (which is the index of UL in
	 *          edgesIndex). etc.
	 * @throws RepresentationException
	 */
	public static int getFinalPositionOfEdge(String representation, int i) throws RepresentationException {
		// Here, we are reusing the position of edges mentioned above.

		if (representation.length() != 54) {
			throw new IllegalArgumentException("Representation size must be 54.");
		}
		if (i < 0 || i >= edges) {
			throw new IllegalArgumentException("Make sure 0 <= i <= 11.");
		}

		int initialEdgeIndex = edgesIndex[i];
		int initialAttachedIndex = attachedEdgesIndex[i];

		char initialColor = representation.charAt(central + initialEdgeIndex / stickersPerFace * stickersPerFace);
		char initialAttachedColor = representation
				.charAt(central + initialAttachedIndex / stickersPerFace * stickersPerFace);

		for (int j = 0; j < edges; j++) {
			char color = representation.charAt(edgesIndex[j]);
			char attachedColor = representation.charAt(attachedEdgesIndex[j]);

			if (color == initialColor && attachedColor == initialAttachedColor) {
				return j;
			}
			if (color == initialAttachedColor && attachedColor == initialColor) {
				return j;
			}
		}

		throw new RepresentationException();
	}

	public static int getFinalPositionOfCorner(String representation, int i) throws RepresentationException {
		// Here, we are reusing the position of edges mentioned above.

		if (representation.length() != 54) {
			throw new IllegalArgumentException("Representation size must be 54.");
		}
		if (i < 0 || i >= corners) {
			throw new IllegalArgumentException("Make sure 0 <= i <= 7.");
		}

		int initialIndex = cornersIndex[i];
		int initialClockWiseIndex = cornersIndexClockWise[i];
		int initialCounterClockWiseIndex = cornersIndexCounterClockWise[i];

		char initialColor = representation.charAt(initialIndex - initialIndex % stickersPerFace + central);
		char initialClockWiseColor = representation
				.charAt(initialClockWiseIndex - initialClockWiseIndex % stickersPerFace + central);
		char initialCounterClockWiseColor = representation
				.charAt(initialCounterClockWiseIndex - initialCounterClockWiseIndex % stickersPerFace + central);		
		String initial = "" + initialColor + initialClockWiseColor + initialCounterClockWiseColor;
		
		for (int j = 0; j < corners; j++) {
			char color = representation.charAt(cornersIndex[j]);
			char clockWiseColor = representation.charAt(cornersIndexClockWise[j]);
			char counterClockWiseColor = representation.charAt(cornersIndexCounterClockWise[j]);

			String current = "" + color + clockWiseColor + counterClockWiseColor;

			if (stringCompareIgnoringOrder(initial, current)) {
				return j;
			}

		}

		throw new RepresentationException();
	}
}
